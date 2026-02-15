import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  finalize,
  forkJoin,
  map,
  switchMap,
  throwError,
} from 'rxjs';
import { CODING_LABS_ACTOR_ID } from '../../../../config/coding-labs.config';
import { CodemirrorEditorComponent } from '../../../../shared/components/codemirror-editor/codemirror-editor.component';
import { CodingLabsApiClient } from '../../api/coding-labs-api-client.service';
import { HintsEditorComponent } from '../../components/hints-editor.component';
import { IoTestcaseEditorComponent } from '../../components/io-testcase-editor.component';
import { RunnerConfigFormComponent } from '../../components/runner-config-form.component';
import {
  CreateDraftVersionDto,
  LabLanguage,
  LabTestCaseDto,
  LabVersionEntity,
  UpdateDraftVersionDto,
} from '../../models/coding-labs.models';
import {
  createDefaultIoTest,
  entityId,
  selectDraftVersion,
  strArray,
  stringOrEmpty,
} from '../../utils/lab-entity.utils';

@Component({
  selector: 'ngx-coding-lab-editor-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    CodemirrorEditorComponent,
    HintsEditorComponent,
    IoTestcaseEditorComponent,
    RunnerConfigFormComponent,
  ],
  template: `
    <section class="page">
      @if (loading()) {
      <div class="state">
        <mat-spinner diameter="30"></mat-spinner>
      </div>
      } @else if (error()) {
      <div class="state error">
        <p>{{ error() }}</p>
        <button mat-button type="button" (click)="load()">
          Retry
        </button>
      </div>
      } @else {
      <header class="header">
        <div>
          <h1>Lab Editor</h1>
          <p>{{ labTitle() }}</p>
        </div>
        <div class="actions">
          <button
            mat-button
            type="button"
            (click)="saveDraft()"
            [disabled]="saving() || publishing()"
          >
            {{ saving() ? 'Saving...' : 'Save Draft' }}
          </button>
          <button
            mat-flat-button
            type="button"
            (click)="publishDraft()"
            [disabled]="publishing() || saving()"
          >
            {{ publishing() ? 'Publishing...' : 'Publish Draft' }}
          </button>
        </div>
      </header>

      @if (publishError()) {
      <p class="error">{{ publishError() }}</p>
      }

      <form class="form" [formGroup]="form">
        <section>
          <h2>Metadata</h2>
          <mat-form-field appearance="outline">
            <mat-label>Language</mat-label>
            <mat-select formControlName="language">
              <mat-option value="typescript">typescript</mat-option>
              <mat-option value="javascript">javascript</mat-option>
            </mat-select>
          </mat-form-field>
        </section>

        <mat-divider></mat-divider>

        <section>
          <h2>Prompt Markdown</h2>
          <textarea
            rows="8"
            formControlName="promptMarkdown"
          ></textarea>
        </section>

        <mat-divider></mat-divider>

        <section>
          <h2>Hints</h2>
          <ngx-hints-editor
            formControlName="hints"
          ></ngx-hints-editor>
        </section>

        <mat-divider></mat-divider>

        <section>
          <h2>Starter Code</h2>
          <ngx-codemirror-editor
            formControlName="starterCode"
            [language]="selectedLanguage()"
          ></ngx-codemirror-editor>
        </section>

        <mat-divider></mat-divider>

        <section>
          <h2>Tests Editor</h2>

          <h3>Sample tests</h3>
          <div class="list">
            @for (ctrl of sampleTests.controls; track $index) {
            <ngx-io-testcase-editor
              [formControl]="$any(ctrl)"
              [language]="selectedLanguage()"
              (remove)="removeSampleTest($index)"
              (jsonErrorsChange)="setSampleJsonErrors($index, $event)"
            ></ngx-io-testcase-editor>
            }
          </div>
          <button
            mat-stroked-button
            type="button"
            (click)="addSampleTest()"
          >
            Add sample test
          </button>

          <h3>Hidden tests</h3>
          <div class="list">
            @for (ctrl of hiddenTests.controls; track $index) {
            <ngx-io-testcase-editor
              [formControl]="$any(ctrl)"
              [language]="selectedLanguage()"
              (remove)="removeHiddenTest($index)"
              (jsonErrorsChange)="setHiddenJsonErrors($index, $event)"
            ></ngx-io-testcase-editor>
            }
          </div>
          <button
            mat-stroked-button
            type="button"
            (click)="addHiddenTest()"
          >
            Add hidden test
          </button>
        </section>

        <mat-divider></mat-divider>

        <section>
          <h2>Runner Config</h2>
          <ngx-runner-config-form
            [form]="runnerGroup"
          ></ngx-runner-config-form>
        </section>

        <mat-divider></mat-divider>

        <section formGroupName="referenceSolution">
          <h2>Reference Solution</h2>
          <ngx-codemirror-editor
            formControlName="code"
            [language]="selectedLanguage()"
          ></ngx-codemirror-editor>

          <label>Notes Markdown</label>
          <textarea
            rows="6"
            formControlName="notesMarkdown"
          ></textarea>
        </section>
      </form>
      }
    </section>
  `,
  styles: [
    `
      .page {
        padding: 20px;
      }

      .state {
        min-height: 140px;
        display: grid;
        place-items: center;
      }

      .state.error,
      .error {
        color: #b3261e;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
      }

      .actions {
        display: flex;
        gap: 8px;
      }

      .form {
        display: grid;
        gap: 16px;
      }

      section {
        display: grid;
        gap: 10px;
      }

      textarea {
        width: 100%;
        border: 1px solid #d5dbe5;
        border-radius: 8px;
        padding: 10px;
        font: inherit;
      }

      .list {
        display: grid;
        gap: 10px;
        margin-bottom: 8px;
      }

      @media (max-width: 900px) {
        .header {
          flex-direction: column;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabEditorPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CodingLabsApiClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly actorId = inject(CODING_LABS_ACTOR_ID);
  private readonly snackBar = inject(MatSnackBar);

  readonly labId = signal('');
  readonly labTitle = signal('');
  readonly versionId = signal('');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly publishing = signal(false);
  readonly error = signal<string | null>(null);
  readonly publishError = signal<string | null>(null);

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
      timeoutMs: this.fb.control<number>(3000, {
        nonNullable: true,
      }),
      memoryMb: this.fb.control<number | null>(256),
      entryFnName: this.fb.control<string>('solve', {
        nonNullable: true,
      }),
      nodeVersion: this.fb.control<string>('20', {
        nonNullable: true,
      }),
    }),
    referenceSolution: this.fb.group({
      code: this.fb.control('', {
        nonNullable: true,
      }),
      notesMarkdown: this.fb.control('', {
        nonNullable: true,
      }),
    }),
  });

  readonly sampleJsonErrors = signal<Record<number, string[]>>({});
  readonly hiddenJsonErrors = signal<Record<number, string[]>>({});

  get sampleTests(): FormArray<FormControl<LabTestCaseDto>> {
    return this.form.controls.sampleTests;
  }

  get hiddenTests(): FormArray<FormControl<LabTestCaseDto>> {
    return this.form.controls.hiddenTests;
  }

  get runnerGroup(): FormGroup {
    return this.form.controls.runner;
  }

  selectedLanguage(): LabLanguage {
    return this.form.controls.language.value;
  }

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.labId.set(params.get('labId') ?? '');
        this.load();
      });
  }

  load(): void {
    const labId = this.labId();
    if (!labId) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      lab: this.api.getLab(labId),
      versions: this.api.listVersions(labId),
    })
      .pipe(
        switchMap(({ lab, versions }) => {
          const draft = selectDraftVersion(lab, versions);
          this.labTitle.set(lab.title ?? '(untitled)');

          if (draft) {
            const versionId = entityId(draft);
            this.versionId.set(versionId);
            return this.api.getVersion(labId, versionId);
          }

          return this.api
            .createDraftVersion(labId, {
              createdBy: this.actorId,
            })
            .pipe(
              switchMap((version) => {
                this.versionId.set(entityId(version));
                return this.api.getVersion(labId, entityId(version));
              })
            );
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (version) => this.patchForm(version),
        error: () => {
          this.error.set('Failed to load editor data.');
        },
      });
  }

  addSampleTest(): void {
    this.sampleTests.push(
      this.fb.control<LabTestCaseDto>(createDefaultIoTest('sample'), {
        nonNullable: true,
      })
    );
  }

  removeSampleTest(index: number): void {
    this.sampleTests.removeAt(index);
    this.removeErrorIndex(this.sampleJsonErrors, index);
  }

  addHiddenTest(): void {
    this.hiddenTests.push(
      this.fb.control<LabTestCaseDto>(createDefaultIoTest('hidden'), {
        nonNullable: true,
      })
    );
  }

  removeHiddenTest(index: number): void {
    this.hiddenTests.removeAt(index);
    this.removeErrorIndex(this.hiddenJsonErrors, index);
  }

  setSampleJsonErrors(
    index: number,
    errors: { inputJson?: string; expectedJson?: string }
  ): void {
    this.setErrors(this.sampleJsonErrors, index, errors);
  }

  setHiddenJsonErrors(
    index: number,
    errors: { inputJson?: string; expectedJson?: string }
  ): void {
    this.setErrors(this.hiddenJsonErrors, index, errors);
  }

  saveDraft(): void {
    const payload = this.buildDraftPayload();

    this.saving.set(true);
    this.publishError.set(null);

    this.persistDraft(payload)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Draft saved', 'Dismiss', {
            duration: 2200,
          });
        },
        error: () => {
          this.snackBar.open('Failed to save draft', 'Dismiss', {
            duration: 3000,
          });
        },
      });
  }

  publishDraft(): void {
    const validationError = this.validatePublish();
    if (validationError) {
      this.publishError.set(validationError);
      return;
    }

    this.publishError.set(null);
    this.publishing.set(true);

    this.saveAndPublishFlow();
  }

  private saveAndPublishFlow(): void {
    const payload = this.buildDraftPayload();
    const labId = this.labId();

    this.persistDraft(payload)
      .pipe(
        switchMap((savedVersion) =>
          this.api.publishVersion(labId, entityId(savedVersion), {
            publishedBy: this.actorId,
          })
        ),
        finalize(() => this.publishing.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Draft published', 'Dismiss', {
            duration: 2400,
          });
          this.router.navigate(['../coding-labs', this.labId()], {
            relativeTo: this.route,
          });
        },
        error: () => {
          this.publishError.set('Failed to publish draft.');
        },
      });
  }

  private validatePublish(): string | null {
    const v = this.form.getRawValue();

    if (!v.promptMarkdown.trim()) {
      return 'Prompt markdown is required before publishing.';
    }

    if (!v.starterCode.trim()) {
      return 'Starter code is required before publishing.';
    }

    if (this.sampleTests.length < 1) {
      return 'At least one sample test is required.';
    }

    const timeoutMs = v.runner.timeoutMs;
    if (timeoutMs < 100 || timeoutMs > 300000) {
      return 'Runner timeoutMs must be between 100 and 300000.';
    }

    if (!v.runner.entryFnName.trim()) {
      return 'Runner entryFnName is required.';
    }

    if (this.hasJsonErrors()) {
      return 'Fix JSON parsing errors in tests before publishing.';
    }

    return null;
  }

  private hasJsonErrors(): boolean {
    const groups = [this.sampleJsonErrors(), this.hiddenJsonErrors()];
    return groups.some((rowErrors) =>
      Object.values(rowErrors).some((errors) => errors.length > 0)
    );
  }

  private patchForm(version: LabVersionEntity): void {
    const language =
      version.language === 'javascript' ? 'javascript' : 'typescript';

    this.form.patchValue({
      language,
      promptMarkdown: stringOrEmpty(version.promptMarkdown),
      hints: strArray(version.hints),
      starterCode: stringOrEmpty(version.starterCode),
      runner: {
        timeoutMs: version.runner?.timeoutMs ?? 3000,
        memoryMb: version.runner?.memoryMb ?? 256,
        entryFnName: version.runner?.entryFnName ?? 'solve',
        nodeVersion: version.runner?.nodeVersion ?? '20',
      },
      referenceSolution: {
        code: version.referenceSolution?.code ?? '',
        notesMarkdown: version.referenceSolution?.notesMarkdown ?? '',
      },
    });

    this.replaceTests(
      this.sampleTests,
      version.sampleTests ?? [createDefaultIoTest('sample')]
    );
    this.replaceTests(this.hiddenTests, version.hiddenTests ?? []);
  }

  private replaceTests(
    target: FormArray<FormControl<LabTestCaseDto>>,
    tests: LabTestCaseDto[]
  ): void {
    target.clear();
    for (const test of tests) {
      target.push(
        this.fb.control<LabTestCaseDto>(
          {
            ...test,
            kind: 'io',
            input: test.input ?? {},
            expected: test.expected ?? {},
            comparator: test.comparator ?? {
              kind: 'deepEqual',
            },
          },
          {
            nonNullable: true,
          }
        )
      );
    }
  }

  private buildDraftPayload():
    | UpdateDraftVersionDto
    | CreateDraftVersionDto {
    const v = this.form.getRawValue();

    return {
      createdBy: this.actorId,
      language: v.language,
      promptMarkdown: v.promptMarkdown,
      hints: v.hints,
      starterCode: v.starterCode,
      sampleTests: this.sampleTests.getRawValue(),
      hiddenTests: this.hiddenTests.getRawValue(),
      runner: {
        timeoutMs: v.runner.timeoutMs,
        memoryMb: v.runner.memoryMb ?? undefined,
        entryFnName: v.runner.entryFnName,
        nodeVersion: v.runner.nodeVersion,
      },
      referenceSolution: {
        code: v.referenceSolution.code,
        notesMarkdown: v.referenceSolution.notesMarkdown,
      },
    };
  }

  private persistDraft(
    payload: UpdateDraftVersionDto | CreateDraftVersionDto
  ) {
    const labId = this.labId();
    const versionId = this.versionId();
    return this.api
      .updateDraftVersion(labId, versionId, payload)
      .pipe(
        catchError((err: { status?: number }) => {
          if (err?.status !== 404 && err?.status !== 405) {
            return throwError(() => err);
          }
          return this.api
            .createDraftVersion(labId, {
              ...(payload as CreateDraftVersionDto),
              createdBy: this.actorId,
            })
            .pipe(
              map((version) => {
                this.versionId.set(entityId(version));
                return version;
              })
            );
        })
      );
  }

  private setErrors(
    source: {
      (): Record<number, string[]>;
      set(value: Record<number, string[]>): void;
    },
    index: number,
    errors: {
      inputJson?: string;
      expectedJson?: string;
    }
  ): void {
    const next = { ...source() };
    next[index] = [errors.inputJson, errors.expectedJson].filter(
      (item): item is string => Boolean(item)
    );
    source.set(next);
  }

  private removeErrorIndex(
    source: {
      (): Record<number, string[]>;
      set(value: Record<number, string[]>): void;
    },
    index: number
  ): void {
    const current = { ...source() };
    delete current[index];
    source.set(current);
  }
}
