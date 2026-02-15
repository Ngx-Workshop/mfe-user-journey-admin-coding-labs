import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, switchMap } from 'rxjs';
import { CODING_LABS_ACTOR_ID } from '../../../../config/coding-labs.config';
import { CodingLabsApiClient } from '../../api/coding-labs-api-client.service';
import { TagsChipsEditorComponent } from '../../components/tags-chips-editor.component';
import { CreateLabDto } from '../../models/coding-labs.models';
import { slugify } from '../../utils/coding-labs-form.utils';
import { entityId } from '../../utils/lab-entity.utils';

@Component({
  selector: 'ngx-coding-lab-create-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    TagsChipsEditorComponent,
  ],
  template: `
    <section class="page">
      <h1>Create Coding Lab</h1>

      @if (error()) {
      <p class="error">{{ error() }}</p>
      }

      <form class="form" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline">
          <mat-label>Workshop ID</mat-label>
          <input matInput formControlName="workshopId" />
          @if (form.controls.workshopId.invalid &&
          form.controls.workshopId.touched) {
          <mat-error>Workshop ID is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
          @if (form.controls.title.invalid &&
          form.controls.title.touched) {
          <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Slug</mat-label>
          <input
            matInput
            formControlName="slug"
            (input)="onSlugInput()"
          />
          @if (form.controls.slug.invalid &&
          form.controls.slug.touched) {
          <mat-error>Slug is required</mat-error>
          }
        </mat-form-field>

        <ngx-tags-chips-editor
          formControlName="tags"
        ></ngx-tags-chips-editor>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>Difficulty</mat-label>
            <mat-select formControlName="difficulty">
              <mat-option value="intro">intro</mat-option>
              <mat-option value="easy">easy</mat-option>
              <mat-option value="medium">medium</mat-option>
              <mat-option value="hard">hard</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Estimated minutes</mat-label>
            <input
              matInput
              type="number"
              formControlName="estimatedMinutes"
            />
          </mat-form-field>
        </div>

        <div class="actions">
          <button mat-flat-button type="submit" [disabled]="saving()">
            {{ saving() ? 'Creating...' : 'Create Lab' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .page {
        padding: 20px;
        display: grid;
        gap: 12px;
        max-width: 860px;
      }

      .form {
        display: grid;
        gap: 12px;
      }

      .row-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
      }

      .error {
        color: #b3261e;
      }

      @media (max-width: 800px) {
        .row-2 {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabCreatePage {
  protected readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CodingLabsApiClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly actorId = inject(CODING_LABS_ACTOR_ID);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    workshopId: this.fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    title: this.fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    slug: this.fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    tags: this.fb.control<string[]>([], { nonNullable: true }),
    difficulty: this.fb.control<'intro' | 'easy' | 'medium' | 'hard'>(
      'intro',
      {
        nonNullable: true,
      }
    ),
    estimatedMinutes: this.fb.control<number | null>(null),
  });

  private slugEdited = false;

  constructor() {
    this.form.controls.title.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((title) => {
        if (this.slugEdited) return;
        this.form.controls.slug.setValue(slugify(title), {
          emitEvent: false,
        });
      });
  }

  onSlugInput(): void {
    this.slugEdited = true;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const dto: CreateLabDto = {
      workshopId: value.workshopId,
      slug: value.slug,
      title: value.title,
      tags: value.tags,
      difficulty: value.difficulty,
      estimatedMinutes: value.estimatedMinutes ?? undefined,
      createdBy: this.actorId,
    };

    this.saving.set(true);
    this.error.set(null);

    this.api
      .createLab(dto)
      .pipe(
        switchMap((lab) => {
          const id = entityId(lab);
          return this.api
            .createDraftVersion(id, {
              createdBy: this.actorId,
              language: 'typescript',
            })
            .pipe(map(() => lab));
        }),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (lab) => {
          const id = entityId(lab);
          this.snackBar.open('Lab created', 'Dismiss', {
            duration: 2200,
          });
          this.router.navigate(['../coding-labs', id, 'editor'], {
            relativeTo: this.route,
          });
        },
        error: () => {
          this.error.set('Failed to create lab.');
        },
      });
  }
}
