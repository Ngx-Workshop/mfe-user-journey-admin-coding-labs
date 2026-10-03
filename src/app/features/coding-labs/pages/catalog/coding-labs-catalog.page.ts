import { DatePipe, TitleCasePipe } from '@angular/common';
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
  styles: [
    `
      .header-background {
        background-color: var(--mat-sys-primary);
      }

      .header-headline {
        color: var(--mat-sys-secondary-container);
      }

      .header-start {
        color: var(--mat-sys-primary-container);
      }

      .header-background {
        overflow: hidden;
        position: relative;
        height: 420px;
      }

      .header-background::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="%23e3e3e3"><path d="M200-120q-51 0-72.5-45.5T138-250l222-270v-240h-40q-17 0-28.5-11.5T280-800q0-17 11.5-28.5T320-840h320q17 0 28.5 11.5T680-800q0 17-11.5 28.5T640-760h-40v240l222 270q32 39 10.5 84.5T760-120H200Zm80-120h400L544-400H416L280-240Zm-80 40h560L520-492v-268h-80v268L200-200Zm280-280Z"/></svg>');
        background-size: 400px;
        background-repeat: no-repeat;
        background-position: 75% 20px;
        opacity: 0.4;
      }

      .header-section {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        height: 100%;
        text-align: center;
        position: relative;
      }

      .header-headline {
        h1 {
          font-size: 7rem;
          font-weight: bold;
          line-height: 5.6rem;
          margin: 15px 5px;
        }

        h2 {
          font-size: 1.4rem;
          font-weight: 100;
          line-height: 28px;
          margin: 15px 0 25px 0;
        }
      }

      .header-start {
        text-align: center;
        margin: 15px 0 0 0;
        .mat-mdc-raised-button {
          font-size: 15px;
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
