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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { CODING_LABS_ACTOR_ID } from '../../../../config/coding-labs.config';
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
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LabStatusChipComponent,
    VersionListComponent,
  ],
  template: `
    <section class="page">
      @if (loading()) {
      <div class="state">
        <mat-spinner diameter="30"></mat-spinner>
      </div>
      } @else if (error()) {
      <div class="state error">
        <p>{{ error() }}</p>
        <button mat-button type="button" (click)="load()">
          Retry
        </button>
      </div>
      } @else if (lab()) {
      <header class="header">
        <div>
          <h1>{{ lab()?.title || '(untitled)' }}</h1>
          <p class="meta">Slug: {{ lab()?.slug || '-' }}</p>
          <p class="meta">Workshop: {{ lab()?.workshopId || '-' }}</p>
        </div>
        <ngx-lab-status-chip
          [status]="status()"
        ></ngx-lab-status-chip>
      </header>

      <div class="actions">
        <button mat-flat-button type="button" (click)="openEditor()">
          Open Editor
        </button>
        <button mat-button type="button" (click)="createNewDraft()">
          Create New Draft
        </button>
        @if (status() !== 'archived') {
        <button mat-button type="button" (click)="archiveLab()">
          Archive Lab
        </button>
        }
      </div>

      <section class="meta-grid">
        <p>
          <strong>Difficulty:</strong> {{ lab()?.difficulty || '-' }}
        </p>
        <p>
          <strong>Estimated Minutes:</strong>
          {{ lab()?.estimatedMinutes ?? '-' }}
        </p>
        <p>
          <strong>Tags:</strong>
          {{ (lab()?.tags || []).join(', ') || '-' }}
        </p>
        <p><strong>Updated:</strong> {{ lab()?.updatedAt || '-' }}</p>
      </section>

      <h2>Versions</h2>
      <ngx-version-list
        [versions]="versions()"
        (view)="viewVersion($event)"
        (editDraft)="editDraft($event)"
        (publish)="publishDraft($event)"
      ></ngx-version-list>
      }
    </section>
  `,
  styles: [
    `
      .page {
        padding: 20px;
        display: grid;
        gap: 14px;
      }

      .state {
        min-height: 140px;
        display: grid;
        place-items: center;
      }

      .state.error {
        color: #b3261e;
      }

      .header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
      }

      .meta {
        margin: 2px 0;
        color: #556070;
      }

      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      @media (max-width: 760px) {
        .meta-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabOverviewPage {
  private readonly api = inject(CodingLabsApiClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly actorId = inject(CODING_LABS_ACTOR_ID);
  private readonly snackBar = inject(MatSnackBar);

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

  createNewDraft(): void {
    const id = this.labId();
    if (!id) return;

    this.api
      .createDraftVersion(id, { createdBy: this.actorId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Draft created', 'Dismiss', {
            duration: 2400,
          });
          this.load();
        },
        error: () => {
          this.snackBar.open('Failed to create draft', 'Dismiss', {
            duration: 3000,
          });
        },
      });
  }

  archiveLab(): void {
    const id = this.labId();
    const name = this.lab()?.title ?? id;
    const ok = confirm(`Archive lab \"${name}\"?`);
    if (!ok) return;

    this.api
      .archiveLab(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Lab archived', 'Dismiss', {
            duration: 2400,
          });
          this.router.navigate(['../coding-labs'], {
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
    if (!version.isDraft) return;
    this.openEditor();
  }

  publishDraft(version: LabVersionEntity): void {
    const versionId = entityId(version);
    this.api
      .publishVersion(this.labId(), versionId, {
        publishedBy: this.actorId,
      })
      .pipe(
        switchMap(() => this.api.listVersions(this.labId())),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (versions) => {
          this.versions.set(newestFirst(versions));
          this.snackBar.open('Draft published', 'Dismiss', {
            duration: 2400,
          });
        },
        error: () => {
          this.snackBar.open('Failed to publish draft', 'Dismiss', {
            duration: 3000,
          });
        },
      });
  }

  draftVersion(): LabVersionEntity | undefined {
    const lab = this.lab();
    if (!lab) return undefined;
    return selectDraftVersion(lab, this.versions());
  }
}
