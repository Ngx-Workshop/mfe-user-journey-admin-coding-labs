import {
  DestroyRef,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CODING_LABS_ACTOR_ID } from '../../../../config/coding-labs.config';
import { CreateLabDto } from '../../models/coding-labs.models';
import { CodingLabsStore } from '../../state/coding-labs.store';
import {
  apiError,
  slugify,
} from '../../utils/coding-labs-form.utils';
import { entityId } from '../../utils/lab-entity.utils';

@Injectable()
export class CodingLabCreateViewModel {
  protected readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(CodingLabsStore);
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

    this.store
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
