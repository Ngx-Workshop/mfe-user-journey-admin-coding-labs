import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EMPTY,
  Subject,
  catchError,
  finalize,
  switchMap,
} from 'rxjs';
import {
  LabEntity,
  LabVersionEntity,
} from '../../models/coding-labs.models';
import { CodingLabsStore } from '../../state/coding-labs.store';
import {
  entityId,
  labStatus,
  selectDraftVersion,
} from '../../utils/lab-entity.utils';

@Injectable()
export class CodingLabOverviewViewModel {
  private readonly store = inject(CodingLabsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  readonly archiving = signal(false);
  readonly labId = signal('');
  readonly lab = computed(
    () => this.store.overview.data()?.lab ?? null
  );
  readonly versions = computed(
    () => this.store.overview.data()?.versions ?? []
  );
  readonly loading = this.store.overview.loading;
  readonly error = this.store.overview.error;
  readonly status = computed(() =>
    this.lab() ? labStatus(this.lab() as LabEntity) : 'draft'
  );

  private readonly refresh = new Subject<void>();

  constructor() {
    this.refresh
      .pipe(
        switchMap(() =>
          this.store
            .loadOverview(this.labId())
            .pipe(catchError(() => EMPTY))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.labId.set(params.get('labId') ?? '');
        this.load();
      });
  }

  load(): void {
    this.refresh.next();
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
    this.store
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
        {
          duration: 4000,
        }
      );
    }
  }

  draftVersion(): LabVersionEntity | undefined {
    const lab = this.lab();
    if (!lab) return undefined;
    return selectDraftVersion(lab, this.versions());
  }
}
