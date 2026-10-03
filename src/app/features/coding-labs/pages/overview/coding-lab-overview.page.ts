import { DatePipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { finalize, forkJoin } from 'rxjs';
import { CodingLabsApiClient } from '../../api/coding-labs-api-client.service';
import { LabStatusChipComponent } from '../../components/lab-status-chip.component';
import { VersionListComponent } from '../../components/version-list.component';
import {
  LabEntity,
  LabVersionEntity,
} from '../../models/coding-labs.models';
import {
  entityId,
  labStatus,
  newestFirst,
  selectDraftVersion,
} from '../../utils/lab-entity.utils';

@Component({
  selector: 'ngx-coding-lab-overview-page',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LabStatusChipComponent,
    VersionListComponent,
    NgxParticleHeader,
    MatIconModule,
  ],
  templateUrl: './coding-lab-overview.page.html',
  styleUrls: ['../journey.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabOverviewPage {
  private readonly api = inject(CodingLabsApiClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  readonly archiving = signal(false);
  readonly labId = signal('');
  readonly lab = signal<LabEntity | null>(null);
  readonly versions = signal<LabVersionEntity[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly status = computed(() =>
    this.lab() ? labStatus(this.lab() as LabEntity) : 'draft'
  );

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.labId.set(params.get('labId') ?? '');
        this.load();
      });
  }

  load(): void {
    const labId = this.labId();
    if (!labId) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      lab: this.api.getLab(labId),
      versions: this.api.listVersions(labId),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ lab, versions }) => {
          this.lab.set(lab);
          this.versions.set(newestFirst(versions));
        },
        error: () => this.error.set('Failed to load lab details.'),
      });
  }

  openEditor(): void {
    const id = this.labId();
    if (!id) return;
    this.router.navigate(['editor'], {
      relativeTo: this.route,
    });
  }

  archiveLab(): void {
    if (this.archiving()) return;
    const id = this.labId();
    const name = this.lab()?.title ?? id;
    const ok = confirm(`Archive lab \"${name}\"?`);
    if (!ok) return;

    this.archiving.set(true);
    this.api
      .archiveLab(id)
      .pipe(
        finalize(() => this.archiving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Lab archived', 'Dismiss', {
            duration: 2400,
          });
          this.router.navigate(['..'], {
            relativeTo: this.route,
          });
        },
        error: () => {
          this.snackBar.open('Failed to archive lab', 'Dismiss', {
            duration: 3000,
          });
        },
      });
  }

  viewVersion(version: LabVersionEntity): void {
    const versionId = entityId(version);
    this.router.navigate(['versions', versionId], {
      relativeTo: this.route,
    });
  }

  editDraft(version: LabVersionEntity): void {
    if (!version.isDraft || this.status() === 'archived') return;
    this.openEditor();
  }

  embedReference(): string {
    return JSON.stringify(
      {
        type: 'handsOnLab',
        labId: this.labId(),
        pinnedVersionId: this.lab()?.latestPublishedVersionId,
      },
      null,
      2
    );
  }

  async copyReference(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.embedReference());
      this.snackBar.open('Embed reference copied', 'Dismiss', {
        duration: 2400,
      });
    } catch {
      this.snackBar.open(
        'Could not copy. Select and copy the reference below.',
        'Dismiss',
        { duration: 4000 }
      );
    }
  }

  draftVersion(): LabVersionEntity | undefined {
    const lab = this.lab();
    if (!lab) return undefined;
    return selectDraftVersion(lab, this.versions());
  }
}
