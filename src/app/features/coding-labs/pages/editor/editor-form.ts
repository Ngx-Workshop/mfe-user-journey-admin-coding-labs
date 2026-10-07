import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {
  LabLanguage,
  LabTestCaseDto,
  LabVersionEntity,
} from '../../models/coding-labs.models';

export function createEditorForm(fb: FormBuilder) {
  return fb.group({
    language: fb.control<LabLanguage>('typescript', {
      nonNullable: true,
    }),
    promptMarkdown: fb.control('', { nonNullable: true }),
    hints: fb.control<string[]>([], { nonNullable: true }),
    starterCode: fb.control('', { nonNullable: true }),
    sampleTests: fb.array<FormControl<LabTestCaseDto>>([]),
    hiddenTests: fb.array<FormControl<LabTestCaseDto>>([]),
    runner: fb.group({
      timeoutMs: fb.control(2000, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(100),
          Validators.max(10000),
        ],
      }),
      memoryMb: fb.control(128, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(64),
          Validators.max(512),
        ],
      }),
      entryFnName: fb.control('solve', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z_$][\w$]*$/),
        ],
      }),
    }),
    referenceSolution: fb.group({
      code: fb.control('', { nonNullable: true }),
      notesMarkdown: fb.control('', { nonNullable: true }),
    }),
  });
}

export type EditorForm = ReturnType<typeof createEditorForm>;

export function applyVersion(
  form: EditorForm,
  version: LabVersionEntity,
  fb: FormBuilder
): void {
  form.patchValue(
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
        notesMarkdown: version.referenceSolution?.notesMarkdown ?? '',
      },
    },
    { emitEvent: false }
  );
  for (const [array, tests] of [
    [form.controls.sampleTests, version.sampleTests],
    [form.controls.hiddenTests, version.hiddenTests],
  ] as const) {
    array.clear({ emitEvent: false });
    tests.forEach((test) =>
      array.push(fb.control(test, { nonNullable: true }), {
        emitEvent: false,
      })
    );
  }
  form.markAsPristine();
}

/** Only learner-visible fields cross into the preview view. */
export function learnerPreview(form: EditorForm) {
  const { promptMarkdown, starterCode, sampleTests } =
    form.getRawValue();
  return { promptMarkdown, starterCode, sampleTests };
}
export type LearnerPreview = ReturnType<typeof learnerPreview>;
