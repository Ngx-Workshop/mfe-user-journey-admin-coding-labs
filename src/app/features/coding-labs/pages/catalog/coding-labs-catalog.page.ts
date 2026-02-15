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
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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
  ],
  template: `
    <section class="page">
      <header class="header">
        <h1>Coding Labs</h1>
        <button mat-flat-button [routerLink]="['/coding-labs/new']">
          Create Lab
        </button>
      </header>

      <form class="filters" [formGroup]="filtersForm">
        <mat-form-field appearance="outline">
          <mat-label>Workshop ID</mat-label>
          <input matInput formControlName="workshopId" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="">Any</mat-option>
            <mat-option value="draft">draft</mat-option>
            <mat-option value="published">published</mat-option>
            <mat-option value="archived">archived</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tag</mat-label>
          <input matInput formControlName="tag" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput formControlName="q" />
        </mat-form-field>
      </form>

      @if (loading()) {
      <div class="state">
        <mat-spinner diameter="30"></mat-spinner>
      </div>
      } @else if (error()) {
      <div class="state error">
        <p>{{ error() }}</p>
        <button mat-button type="button" (click)="reload()">
          Retry
        </button>
      </div>
      } @else if (labs().length === 0) {
      <div class="state"><p>No labs found.</p></div>
      } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Tags</th>
              <th>Difficulty</th>
              <th>Est. minutes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (lab of labs(); track trackLab(lab)) {
            <tr>
              <td>{{ lab.title || '(untitled)' }}</td>
              <td>
                <ngx-lab-status-chip
                  [status]="toStatus(lab)"
                ></ngx-lab-status-chip>
              </td>
              <td>{{ lab.updatedAt || '-' }}</td>
              <td>{{ (lab.tags || []).join(', ') || '-' }}</td>
              <td>{{ lab.difficulty || '-' }}</td>
              <td>{{ lab.estimatedMinutes ?? '-' }}</td>
              <td class="actions">
                <button
                  mat-button
                  type="button"
                  [routerLink]="['../coding-labs', trackLab(lab)]"
                >
                  Open
                </button>
                @if (toStatus(lab) !== 'archived') {
                <button
                  mat-button
                  type="button"
                  (click)="archive(lab)"
                >
                  Archive
                </button>
                }
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      }
    </section>
  `,
  styles: [
    `
      .page {
        padding: 20px;
        display: grid;
        gap: 16px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .filters {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .table-wrap {
        overflow: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 10px 8px;
        border-bottom: 1px solid #e1e6ee;
        text-align: left;
      }

      .actions {
        white-space: nowrap;
      }

      .state {
        min-height: 140px;
        display: grid;
        place-items: center;
      }

      .state.error {
        color: #b3261e;
      }

      @media (max-width: 960px) {
        .filters {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 640px) {
        .filters {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['../'], {
          relativeTo: this.route,
          queryParams: this.toQueryParams(),
          queryParamsHandling: 'merge',
        });
      });
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
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
    if (!id) return;

    const confirmed = confirm(`Archive lab \"${lab.title ?? id}\"?`);
    if (!confirmed) return;

    this.api
      .archiveLab(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
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
