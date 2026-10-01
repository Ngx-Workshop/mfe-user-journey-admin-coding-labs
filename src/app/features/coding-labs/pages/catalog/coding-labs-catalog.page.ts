import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, finalize, Subscription } from 'rxjs';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { CodingLabsApiClient } from '../../api/coding-labs-api-client.service';
import { LabStatusChipComponent } from '../../components/lab-status-chip.component';
import { LabEntity } from '../../models/coding-labs.models';
import { entityId, labStatus } from '../../utils/lab-entity.utils';

@Component({
  selector: 'ngx-coding-labs-catalog-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    LabStatusChipComponent,
    DatePipe,
    TitleCasePipe,
    MatIconModule,
  ],
  templateUrl: './coding-labs-catalog.page.html',
  styleUrls: ['../journey.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabsCatalogPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CodingLabsApiClient);
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

  private listRequest?: Subscription;
  readonly archivingId = signal('');
  readonly labs = signal<LabEntity[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
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
    this.listRequest?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);
    this.listRequest = this.api
      .listLabs(this.toQueryParams())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (labs) => this.labs.set(labs),
        error: () => this.error.set('Failed to load labs.'),
      });
  }

  archive(lab: LabEntity): void {
    const id = entityId(lab);
    if (!id || this.archivingId()) return;

    const confirmed = confirm(`Archive lab \"${lab.title ?? id}\"?`);
    if (!confirmed) return;

    this.archivingId.set(id);
    this.api
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
