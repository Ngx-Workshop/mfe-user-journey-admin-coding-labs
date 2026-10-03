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
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { finalize } from 'rxjs';
import { CODING_LABS_ACTOR_ID } from '../../../../config/coding-labs.config';
import { CodingLabsApiClient } from '../../api/coding-labs-api-client.service';
import { TagsChipsEditorComponent } from '../../components/tags-chips-editor.component';
import { CreateLabDto } from '../../models/coding-labs.models';
import {
  apiError,
  slugify,
} from '../../utils/coding-labs-form.utils';
import { entityId } from '../../utils/lab-entity.utils';

@Component({
  selector: 'ngx-coding-lab-create-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    TagsChipsEditorComponent,
    NgxParticleHeader,
    MatIconModule,
  ],
  template: `
    <ngx-particle-header class="particle-header">
      <h1>Create a coding lab</h1>
    </ngx-particle-header>
    <div class="particle-header-action-bar">
      <a matButton="filled" [routerLink]="['..']"
        ><mat-icon>arrow_back</mat-icon>All coding labs</a
      >
    </div>
    <section class="page">
      <div class="wrapper">
        <header class="page-header">
          <div>
            <p class="eyebrow">New challenge · Step 1 of 2</p>
            <!-- <h1>Create a coding lab</h1> -->
            <p class="subtitle">
              Start with the details. Next, you’ll write the problem,
              code, and test cases.
            </p>
          </div>
        </header>

        @if (error()) {
        <p class="banner error" role="alert">{{ error() }}</p>
        }

        <form
          class="form panel"
          [formGroup]="form"
          (ngSubmit)="submit()"
        >
          <mat-form-field appearance="outline">
            <mat-label>Workshop ID</mat-label>
            <input matInput formControlName="workshopId" required />
            <mat-hint
              >The workshop this challenge belongs to.</mat-hint
            >
            @if ( form.controls.workshopId.invalid &&
            form.controls.workshopId.touched ) {
            <mat-error>Workshop ID is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input
              matInput
              formControlName="title"
              required
              maxlength="200"
            />
            @if ( form.controls.title.invalid &&
            form.controls.title.touched ) {
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
            <mat-hint
              >Generated from the title; you can customize
              it.</mat-hint
            >
            @if ( form.controls.slug.invalid &&
            form.controls.slug.touched ) {
            <mat-error
              >Use lowercase letters, numbers, and single
              hyphens.</mat-error
            >
            }
          </mat-form-field>

          <ngx-tags-chips-editor
            formControlName="tags"
          ></ngx-tags-chips-editor>

          <div class="row-2">
            <mat-form-field appearance="outline">
              <mat-label>Difficulty</mat-label>
              <mat-select formControlName="difficulty">
                <mat-option value="intro">Introductory</mat-option>
                <mat-option value="easy">Easy</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="hard">Hard</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estimated minutes</mat-label>
              <input
                matInput
                type="number"
                min="1"
                max="600"
                formControlName="estimatedMinutes"
              />
              <mat-hint>Optional · 1–600 minutes.</mat-hint>
              <mat-error
                >Enter a duration between 1 and 600
                minutes.</mat-error
              >
            </mat-form-field>
          </div>

          <div class="actions">
            <a mat-button [routerLink]="['..']" [disabled]="saving()"
              >Cancel</a
            >
            <button
              mat-flat-button
              type="submit"
              [disabled]="saving()"
            >
              {{
                saving() ? 'Creating lab…' : 'Create and open editor'
              }}
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
  styleUrls: ['../journey.scss'],
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
      validators: [
        Validators.required,
        Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      ],
      nonNullable: true,
    }),
    tags: this.fb.control<string[]>([], { nonNullable: true }),
    difficulty: this.fb.control<'intro' | 'easy' | 'medium' | 'hard'>(
      'intro',
      {
        nonNullable: true,
      }
    ),
    estimatedMinutes: this.fb.control<number | null>(null, [
      Validators.min(1),
      Validators.max(600),
    ]),
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
    if (this.saving()) return;
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
    this.form.disable({ emitEvent: false });
    this.error.set(null);

    this.api
      .createLab(dto)
      .pipe(
        finalize(() => {
          this.saving.set(false);
          this.form.enable({ emitEvent: false });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (lab) => {
          const id = entityId(lab);
          this.snackBar.open('Lab created', 'Dismiss', {
            duration: 2200,
          });
          this.router.navigate(['..', id, 'editor'], {
            relativeTo: this.route,
          });
        },
        error: (error) => {
          this.error.set(apiError(error, 'Failed to create lab.'));
        },
      });
  }
}
