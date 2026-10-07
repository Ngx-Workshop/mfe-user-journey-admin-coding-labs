import {
  DestroyRef,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  EMPTY,
  Subject,
  catchError,
  finalize,
  switchMap,
  tap,
  takeUntil,
} from 'rxjs';
import { CODING_LABS_ACTOR_ID } from '../../../config/coding-labs.config';
import {
  LabVersionEntity,
  UpdateDraftVersionDto,
  VerificationDto,
} from '../../models/coding-labs.models';
import {
  CodingLabsStore,
  DraftAction,
} from '../../state/coding-labs.store';
import { apiError } from '../../utils/coding-labs-form.utils';
import {
  createDefaultIoTest,
  entityId,
} from '../../utils/lab-entity.utils';
import {
  applyVersion,
  createEditorForm,
  learnerPreview,
} from './editor-form';

@Injectable()
export class CodingLabEditorViewModel {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(CodingLabsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly actorId = inject(CODING_LABS_ACTOR_ID);

  readonly labId = signal('');
  readonly labTitle = signal('');
  readonly versionId = signal('');
  readonly versionNumber = signal(1);
  readonly versionHash = signal('');
  readonly loading = this.store.editor.loading;
  readonly busy = signal('');
  readonly error = signal<string | null>(null);
  readonly notice = signal('');
  readonly dirty = signal(false);
  readonly published = signal(false);
  readonly verification = signal<VerificationDto | null>(null);
  readonly sampleJsonErrors = signal<Record<number, string[]>>({});
  readonly hiddenJsonErrors = signal<Record<number, string[]>>({});

  readonly form = createEditorForm(this.fb);
  private readonly previewState = signal(learnerPreview(this.form));
  readonly preview = this.previewState.asReadonly();

  get sampleTests() {
    return this.form.controls.sampleTests;
  }
  get hiddenTests() {
    return this.form.controls.hiddenTests;
  }
  private readonly refresh = new Subject<void>();

  constructor() {
    this.refresh
      .pipe(
        switchMap(() => {
          this.published.set(false);
          this.versionId.set('');
          this.verification.set(null);
          this.notice.set('');
          this.error.set(null);
          this.form.enable({ emitEvent: false });
          return this.store.openDraft(this.labId()).pipe(
            tap(({ lab, version }) => {
              this.labTitle.set(lab.title);
              this.patchForm(version);
            }),
            catchError((error) => {
              this.error.set(
                apiError(error, 'Could not load this challenge.')
              );
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.previewState.set(learnerPreview(this.form));
        this.dirty.set(true);
        this.verification.set(null);
        this.notice.set('');
      });
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.labId.set(params.get('labId') ?? '');
        this.load();
      });
  }

  beforeUnload(event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  hasUnsavedChanges() {
    return this.dirty() && !this.published();
  }

  load() {
    if (this.labId()) this.refresh.next();
  }

  addTest(suite: 'sample' | 'hidden') {
    const array =
      suite === 'sample' ? this.sampleTests : this.hiddenTests;
    array.push(
      this.fb.control(
        createDefaultIoTest(suite + ' ' + (array.length + 1)),
        { nonNullable: true }
      )
    );
    this.dirty.set(true);
  }

  removeTest(suite: 'sample' | 'hidden', index: number) {
    const array =
      suite === 'sample' ? this.sampleTests : this.hiddenTests;
    array.removeAt(index);
    const errors =
      suite === 'sample'
        ? this.sampleJsonErrors
        : this.hiddenJsonErrors;
    const next: Record<number, string[]> = {};
    Object.entries(errors()).forEach(([key, value]) => {
      const i = Number(key);
      if (i !== index) next[i > index ? i - 1 : i] = value;
    });
    errors.set(next);
    this.dirty.set(true);
  }

  setJsonErrors(
    suite: 'sample' | 'hidden',
    index: number,
    value: { inputJson?: string; expectedJson?: string }
  ) {
    const errors =
      suite === 'sample'
        ? this.sampleJsonErrors
        : this.hiddenJsonErrors;
    errors.set({
      ...errors(),
      [index]: Object.values(value).filter((v): v is string => !!v),
    });
  }

  private validate(action: DraftAction): boolean {
    this.error.set(null);
    if (
      [this.sampleJsonErrors(), this.hiddenJsonErrors()].some(
        (group) => Object.values(group).some((v) => v.length)
      )
    ) {
      this.error.set(
        'Fix invalid JSON in the test cases before saving.'
      );
      return false;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(
        'Check the function name, timeout (100–10000 ms) and memory (64–512 MB).'
      );
      return false;
    }
    const value = this.form.getRawValue();
    if (
      [...value.sampleTests, ...value.hiddenTests].some(
        (test) => test.kind !== 'io'
      )
    ) {
      this.error.set(
        'This legacy draft contains unit tests. Convert them to input/output tests before editing.'
      );
      return false;
    }
    if (
      action !== 'save' &&
      (!value.promptMarkdown.trim() ||
        !value.starterCode.trim() ||
        !value.referenceSolution.code.trim() ||
        !value.sampleTests.length ||
        !value.hiddenTests.length)
    ) {
      this.error.set(
        'Add a problem statement, starter code, reference solution, and at least one sample and one hidden test.'
      );
      return false;
    }
    return true;
  }

  private payload() {
    const value = this.form.getRawValue();
    const payload: UpdateDraftVersionDto = {
      ...value,
      createdBy: this.actorId,
      expectedContentHash: this.versionHash(),
      referenceSolution: {
        code: value.referenceSolution.code,
        notesMarkdown: value.referenceSolution.notesMarkdown,
      },
    };
    return payload;
  }

  saveDraft() {
    this.perform('save');
  }
  verifyReference() {
    this.perform('verify');
  }
  publishDraft() {
    this.perform('publish');
  }

  private perform(action: DraftAction) {
    if (this.busy() || this.published() || !this.validate(action))
      return;
    this.busy.set(action);
    this.notice.set('');
    this.verification.set(null);
    this.form.disable({ emitEvent: false });
    const operation = this.store.runDraft(
      action,
      this.labId(),
      this.versionId(),
      this.payload()
    );
    operation
      .pipe(
        finalize(() => {
          this.busy.set('');
          if (!this.published())
            this.form.enable({ emitEvent: false });
        }),
        takeUntil(this.refresh),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (event) => {
          if (event.kind === 'saved') {
            this.versionHash.set(event.version.contentHash ?? '');
            this.dirty.set(false);
            this.form.markAsPristine();
            return;
          }
          if (event.kind === 'verified') {
            const verification = event.verification;
            this.verification.set(verification);
            this.notice.set(
              verification.passed
                ? 'All tests passed. This draft is ready to publish.'
                : 'Some tests did not pass. Review the results below.'
            );
          } else if (event.kind === 'published') {
            this.published.set(true);
            this.dirty.set(false);
            this.notice.set(
              'Version ' +
                this.versionNumber() +
                ' published. Workshop content can now use this version.'
            );
          } else this.notice.set('Draft saved.');
        },
        error: (error) => {
          this.error.set(apiError(error));
          if (error?.error?.verification)
            this.verification.set(error.error.verification);
        },
      });
  }

  private patchForm(version: LabVersionEntity) {
    this.versionId.set(entityId(version));
    this.versionNumber.set(version.versionNumber);
    this.versionHash.set(version.contentHash ?? '');
    this.sampleJsonErrors.set({});
    this.hiddenJsonErrors.set({});
    applyVersion(this.form, version, this.fb);
    this.previewState.set(learnerPreview(this.form));
    this.dirty.set(false);
  }
}
