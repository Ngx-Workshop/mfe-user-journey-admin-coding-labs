import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  EMPTY,
  finalize,
  Subject,
  switchMap,
} from 'rxjs';
import { LabEntity } from '../../models/coding-labs.models';
import { CodingLabsStore } from '../../state/coding-labs.store';
import { entityId, labStatus } from '../../utils/lab-entity.utils';

@Injectable()
export class CodingLabsCatalogViewModel {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(CodingLabsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  readonly filtersForm = this.fb.group({
    workshopId: this.fb.control(''),
    status: this.fb.control(''),
    tag: this.fb.control(''),
    q: this.fb.control(''),
  });

  readonly archivingId = signal('');
  readonly labs = computed(() => this.store.catalog.data() ?? []);
  readonly loading = this.store.catalog.loading;
  readonly error = this.store.catalog.error;

  private readonly refresh = new Subject<void>();

  constructor() {
    this.refresh
      .pipe(
        switchMap(() =>
          this.store
            .loadCatalog(this.toQueryParams())
            .pipe(catchError(() => EMPTY))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.filtersForm.patchValue(
          {
            workshopId: params.get('workshopId') ?? '',
            status: params.get('status') ?? '',
            tag: params.get('tag') ?? '',
            q: params.get('q') ?? '',
          },
          { emitEvent: false }
        );
        this.reload();
      });

    this.filtersForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: this.toQueryParams(),
          replaceUrl: true,
        });
      });
  }

  reload(): void {
    this.refresh.next();
  }

  archive(lab: LabEntity): void {
    const id = entityId(lab);
    if (!id || this.archivingId()) return;

    const confirmed = confirm(`Archive lab \"${lab.title ?? id}\"?`);
    if (!confirmed) return;

    this.archivingId.set(id);
    this.store
      .archiveLab(id)
      .pipe(
        finalize(() => this.archivingId.set('')),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Lab archived', 'Dismiss', {
            duration: 2400,
          });
          this.reload();
        },
        error: () => {
          this.snackBar.open('Failed to archive lab', 'Dismiss', {
            duration: 3000,
          });
        },
      });
  }

  trackLab(lab: LabEntity): string {
    return entityId(lab);
  }

  toStatus(lab: LabEntity) {
    return labStatus(lab);
  }

  hasFilters(): boolean {
    return Object.values(this.filtersForm.getRawValue()).some(
      Boolean
    );
  }

  clearFilters(): void {
    this.filtersForm.reset({}, { emitEvent: false });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }

  private toQueryParams(): Record<string, string> {
    const v = this.filtersForm.getRawValue();
    return {
      ...(v.workshopId ? { workshopId: v.workshopId } : {}),
      ...(v.status ? { status: v.status } : {}),
      ...(v.tag ? { tag: v.tag } : {}),
      ...(v.q ? { q: v.q } : {}),
    };
  }
}
