import { marked } from 'marked';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, finalize, forkJoin, switchMap, tap } from 'rxjs';
import { CODING_LABS_ACTOR_ID } from '../../../../config/coding-labs.config';
import { CodemirrorEditorComponent } from '../../../../shared/components/codemirror-editor/codemirror-editor.component';
import { CodingLabsApiClient } from '../../api/coding-labs-api-client.service';
import { HintsEditorComponent } from '../../components/hints-editor.component';
import { IoTestcaseEditorComponent } from '../../components/io-testcase-editor.component';
import {
  LabLanguage,
  LabTestCaseDto,
  LabVersionEntity,
  UpdateDraftVersionDto,
  VerificationDto,
} from '../../models/coding-labs.models';
import {
  createDefaultIoTest,
  entityId,
  selectDraftVersion,
} from '../../utils/lab-entity.utils';
import { apiError } from '../../utils/coding-labs-form.utils';

@Component({
  selector: 'ngx-coding-lab-editor-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTabsModule,
    CodemirrorEditorComponent,
    HintsEditorComponent,
    IoTestcaseEditorComponent,
  ],
  templateUrl: './coding-lab-editor.page.html',
  styleUrl: './coding-lab-editor.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabEditorPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CodingLabsApiClient);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly actorId = inject(CODING_LABS_ACTOR_ID);

  readonly labId = signal('');
  readonly labTitle = signal('');
  readonly versionId = signal('');
  readonly versionNumber = signal(1);
  readonly versionHash = signal('');
  readonly loading = signal(true);
  readonly busy = signal('');
  readonly error = signal<string | null>(null);
  readonly notice = signal('');
  readonly dirty = signal(false);
  readonly published = signal(false);
  readonly verification = signal<VerificationDto | null>(null);
  readonly sampleJsonErrors = signal<Record<number, string[]>>({});
  readonly hiddenJsonErrors = signal<Record<number, string[]>>({});

  readonly form = this.fb.group({
    language: this.fb.control<LabLanguage>('typescript', {
      nonNullable: true,
    }),
    promptMarkdown: this.fb.control('', { nonNullable: true }),
    hints: this.fb.control<string[]>([], { nonNullable: true }),
    starterCode: this.fb.control('', { nonNullable: true }),
    sampleTests: this.fb.array<FormControl<LabTestCaseDto>>([]),
    hiddenTests: this.fb.array<FormControl<LabTestCaseDto>>([]),
    runner: this.fb.group({
      timeoutMs: this.fb.control(2000, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(100),
          Validators.max(10000),
        ],
      }),
      memoryMb: this.fb.control(128, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(64),
          Validators.max(512),
        ],
      }),
      entryFnName: this.fb.control('solve', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z_$][\w$]*$/),
        ],
      }),
    }),
    referenceSolution: this.fb.group({
      code: this.fb.control('', { nonNullable: true }),
      notesMarkdown: this.fb.control('', { nonNullable: true }),
    }),
  });

  get sampleTests() {
    return this.form.controls.sampleTests;
  }
  get hiddenTests() {
    return this.form.controls.hiddenTests;
  }
  previewMarkdown() {
    return marked.parse(this.form.controls.promptMarkdown.value, {
      async: false,
    });
  }
  selectedLanguage() {
    return this.form.controls.language.value;
  }

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
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

  @HostListener('window:beforeunload', ['$event'])
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
    if (!this.labId()) return;
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      lab: this.api.getLab(this.labId()),
      versions: this.api.listVersions(this.labId()),
    })
      .pipe(
        switchMap(({ lab, versions }) => {
          this.labTitle.set(lab.title);
          const draft = selectDraftVersion(lab, versions);
          return draft
            ? this.api.getVersion(this.labId(), entityId(draft))
            : this.api.createDraftVersion(this.labId(), {
                createdBy: this.actorId,
              });
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (version) => this.patchForm(version),
        error: (error) =>
          this.error.set(
            apiError(error, 'Could not load this challenge.')
          ),
      });
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

  private validate(action: 'save' | 'verify' | 'publish'): boolean {
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

  private persist() {
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
    return this.api
      .updateDraftVersion(this.labId(), this.versionId(), payload)
      .pipe(
        tap((version) => {
          this.versionHash.set(version.contentHash ?? '');
          this.dirty.set(false);
          this.form.markAsPristine();
        })
      );
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

  private perform(action: 'save' | 'verify' | 'publish') {
    if (this.busy() || this.published() || !this.validate(action))
      return;
    this.busy.set(action);
    this.notice.set('');
    this.verification.set(null);
    this.form.disable({ emitEvent: false });
    const save = this.persist();
    const operation: Observable<LabVersionEntity | VerificationDto> =
      action === 'save'
        ? save
        : action === 'verify'
          ? save.pipe(
              switchMap(() =>
                this.api.verifyVersion(this.labId(), this.versionId())
              )
            )
          : save.pipe(
              switchMap(() =>
                this.api.publishVersion(
                  this.labId(),
                  this.versionId(),
                  {
                    publishedBy: this.actorId,
                    expectedContentHash: this.versionHash(),
                  }
                )
              )
            );
    operation
      .pipe(
        finalize(() => {
          this.busy.set('');
          if (!this.published())
            this.form.enable({ emitEvent: false });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => {
          if (action === 'verify') {
            const verification = result as VerificationDto;
            this.verification.set(verification);
            this.notice.set(
              verification.passed
                ? 'All tests passed. This draft is ready to publish.'
                : 'Some tests did not pass. Review the results below.'
            );
          } else if (action === 'publish') {
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
    this.form.patchValue(
      {
        language: version.language,
        promptMarkdown: version.promptMarkdown,
        hints: version.hints ?? [],
        starterCode: version.starterCode,
        runner: {
          timeoutMs: version.runner.timeoutMs,
          memoryMb: version.runner.memoryMb ?? 128,
          entryFnName: version.runner.entryFnName ?? 'solve',
        },
        referenceSolution: {
          code: version.referenceSolution?.code ?? '',
          notesMarkdown:
            version.referenceSolution?.notesMarkdown ?? '',
        },
      },
      { emitEvent: false }
    );
    for (const [array, tests] of [
      [this.sampleTests, version.sampleTests],
      [this.hiddenTests, version.hiddenTests],
    ] as const) {
      array.clear({ emitEvent: false });
      tests.forEach((test) =>
        array.push(this.fb.control(test, { nonNullable: true }), {
          emitEvent: false,
        })
      );
    }
    this.dirty.set(false);
    this.form.markAsPristine();
  }
}
