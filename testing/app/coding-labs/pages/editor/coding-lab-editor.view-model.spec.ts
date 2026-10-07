import { By } from '@angular/platform-browser';
import { EditorTestsComponent } from '../../../../../src/app/coding-labs/pages/editor/editor-tests.component';
import { JsonValueEditorComponent } from '../../../../../src/app/coding-labs/components/json-value-editor.component';
import { ComparatorEditorComponent } from '../../../../../src/app/coding-labs/components/comparator-editor.component';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { CodingLabsApiClient } from '../../../../../src/app/coding-labs/api/coding-labs-api-client.service';
import { LabVersionEntity } from '../../../../../src/app/coding-labs/models/coding-labs.models';
import { CodingLabEditorViewModel } from '../../../../../src/app/coding-labs/pages/editor/coding-lab-editor.view-model';

const draft: LabVersionEntity = {
  createdAt: '2026-10-07',
  createdBy: 'actor',
  _id: 'draft',
  labId: 'lab',
  versionNumber: 1,
  isDraft: true,
  language: 'typescript',
  contentHash: 'loaded',
  promptMarkdown: 'Add values',
  starterCode: 'function solve(x) {}',
  hints: [],
  sampleTests: [
    { kind: 'io', name: 'sample', input: [1], expected: 1 },
  ],
  hiddenTests: [
    { kind: 'io', name: 'hidden', input: [], expected: 0 },
  ],
  runner: { timeoutMs: 2000, memoryMb: 128, entryFnName: 'solve' },
  referenceSolution: { code: 'function solve(x) { return 0; }' },
};

describe('Editor view model', () => {
  let vm: CodingLabEditorViewModel;
  let api: { [key: string]: jasmine.Spy };
  beforeEach(() => {
    api = {
      getLab: jasmine
        .createSpy()
        .and.returnValue(
          of({
            _id: 'lab',
            title: 'Lab',
            currentDraftVersionId: 'draft',
          })
        ),
      listVersions: jasmine.createSpy().and.returnValue(of([draft])),
      getVersion: jasmine.createSpy().and.returnValue(of(draft)),
      updateDraftVersion: jasmine
        .createSpy()
        .and.returnValue(of({ ...draft, contentHash: 'saved' })),
      verifyVersion: jasmine
        .createSpy()
        .and.returnValue(of({ passed: true, results: [] })),
      publishVersion: jasmine
        .createSpy()
        .and.returnValue(of({ ...draft, isDraft: false })),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CodingLabsApiClient, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ labId: 'lab' })),
          },
        },
      ],
    });
    vm = TestBed.runInInjectionContext(
      () => new CodingLabEditorViewModel()
    );
  });

  it('streams loaded and edited learner fields without exposing hidden tests or reference code', () => {
    expect(vm.preview().promptMarkdown).toBe('Add values');
    expect(Object.keys(vm.preview()).sort()).toEqual([
      'promptMarkdown',
      'sampleTests',
      'starterCode',
    ]);
    vm.form.controls.promptMarkdown.setValue('Changed preview');
    expect(vm.preview().promptMarkdown).toBe('Changed preview');
  });

  it('blocks invalid JSON and keeps unsaved protection active', () => {
    vm.form.controls.promptMarkdown.setValue('Changed');
    vm.setJsonErrors('sample', 0, { inputJson: 'Invalid JSON' });
    vm.saveDraft();
    expect(api['updateDraftVersion']).not.toHaveBeenCalled();
    expect(vm.hasUnsavedChanges()).toBeTrue();
    expect(vm.error()).toContain('invalid JSON');
  });

  it('retains edits and enables retry after a conflict', () => {
    api['updateDraftVersion'].and.returnValue(
      throwError(() => ({ error: { message: 'Stale draft' } }))
    );
    vm.form.controls.promptMarkdown.setValue('Recoverable edits');
    vm.saveDraft();
    expect(vm.form.controls.promptMarkdown.value).toBe(
      'Recoverable edits'
    );
    expect(vm.form.enabled).toBeTrue();
    expect(vm.hasUnsavedChanges()).toBeTrue();
    expect(vm.versionHash()).toBe('loaded');
    expect(vm.error()).toBe('Stale draft');
  });

  it('disables repeated operations and leaves a publication read only', () => {
    const save = new Subject<LabVersionEntity>();
    api['updateDraftVersion'].and.returnValue(save);
    vm.publishDraft();
    vm.publishDraft();
    expect(api['updateDraftVersion']).toHaveBeenCalledTimes(1);
    expect(vm.form.disabled).toBeTrue();
    save.next({ ...draft, contentHash: 'saved' });
    save.complete();
    expect(api['publishVersion']).toHaveBeenCalledWith(
      'lab',
      'draft',
      jasmine.objectContaining({ expectedContentHash: 'saved' })
    );
    expect(vm.published()).toBeTrue();
    expect(vm.form.disabled).toBeTrue();
    expect(vm.hasUnsavedChanges()).toBeFalse();
  });

  it('reindexes JSON errors when a test case is removed', () => {
    vm.addTest('sample');
    vm.setJsonErrors('sample', 1, { inputJson: 'Invalid' });
    vm.removeTest('sample', 0);
    expect(vm.sampleJsonErrors()).toEqual({ 0: ['Invalid'] });
    vm.saveDraft();
    expect(api['updateDraftVersion']).not.toHaveBeenCalled();
  });
  it('connects extracted comparator and JSON views to the original form controls', () => {
    const fixture = TestBed.createComponent(EditorTestsComponent);
    fixture.componentRef.setInput('form', vm.form);
    fixture.componentInstance.jsonErrors.subscribe((event) =>
      vm.setJsonErrors(event.suite, event.index, event.errors)
    );
    fixture.detectChanges();
    const comparator = fixture.debugElement.query(
      By.directive(ComparatorEditorComponent)
    ).componentInstance as ComparatorEditorComponent;
    comparator.change.emit({ key: 'kind', value: 'strictEqual' });
    expect(vm.sampleTests.at(0).value.comparator?.kind).toBe(
      'strictEqual'
    );
    const json = fixture.debugElement.query(
      By.directive(JsonValueEditorComponent)
    ).componentInstance as JsonValueEditorComponent;
    json.valueChange.emit('malformed JSON');
    vm.saveDraft();
    expect(api['updateDraftVersion']).not.toHaveBeenCalled();
    expect(vm.error()).toContain('invalid JSON');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const add = [
      ...fixture.nativeElement.querySelectorAll('button'),
    ] as HTMLButtonElement[];
    expect(
      add.find((button) =>
        button.textContent?.includes('Add sample test')
      )?.disabled
    ).toBeTrue();
  });
});
