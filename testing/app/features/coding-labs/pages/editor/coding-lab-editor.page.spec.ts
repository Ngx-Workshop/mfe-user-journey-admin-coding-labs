import { FormBuilder } from '@angular/forms';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CodingLabEditorPage } from '../../../../../../src/app/features/coding-labs/pages/editor/coding-lab-editor.page';
import { CodingLabEditorViewModel } from '../../../../../../src/app/features/coding-labs/pages/editor/coding-lab-editor.view-model';
import { createEditorForm, learnerPreview } from '../../../../../../src/app/features/coding-labs/pages/editor/editor-form';

describe('Challenge studio layout', () => {
  const setup = () => {
    const form = createEditorForm(new FormBuilder());
    const vm = {
      form, labTitle: signal('Challenge'), versionNumber: signal(3), versionId: signal('draft'),
      loading: signal(false), busy: signal(''), published: signal(false), dirty: signal(false),
      error: signal(null), notice: signal(''), verification: signal(null),
      preview: () => learnerPreview(form), saveDraft: jasmine.createSpy('save'),
      verifyReference: jasmine.createSpy('verify'), publishDraft: jasmine.createSpy('publish'),
      addTest: jasmine.createSpy(), removeTest: jasmine.createSpy(), setJsonErrors: jasmine.createSpy(),
      beforeUnload: jasmine.createSpy(), hasUnsavedChanges: () => form.dirty,
    };
    TestBed.configureTestingModule({ imports: [CodingLabEditorPage], providers: [provideRouter([])] });
    TestBed.overrideComponent(CodingLabEditorPage, { set: { providers: [{ provide: CodingLabEditorViewModel, useValue: vm }] } });
    const fixture = TestBed.createComponent(CodingLabEditorPage);
    fixture.detectChanges();
    return { fixture, vm };
  };
  it('retains the same edited controls and code editor while switching sections and panels', () => {
    const { fixture, vm } = setup();
    const prompt: HTMLTextAreaElement = fixture.nativeElement.querySelector('#statement');
    const editor = fixture.nativeElement.querySelector('ngx-codemirror-editor');
    prompt.value = 'Retained problem';
    prompt.dispatchEvent(new Event('input'));
    const button = (label: string) => [...fixture.nativeElement.querySelectorAll('nav button')].find((b: any) => b.textContent.trim() === label) as HTMLButtonElement;
    button('Code').click(); fixture.detectChanges();
    expect(vm.form.controls.promptMarkdown.value).toBe('Retained problem');
    fixture.componentInstance.pane.set('checks'); fixture.detectChanges();
    fixture.componentInstance.pane.set('editor');
    button('Problem').click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#statement')).toBe(prompt);
    expect(prompt.value).toBe('Retained problem');
    expect(fixture.nativeElement.querySelector('ngx-codemirror-editor')).toBe(editor);
  });
  it('wires commands and locks authoring actions after publication', () => {
    const { fixture, vm } = setup();
    const buttons = [...fixture.nativeElement.querySelectorAll('.labs-journey__actions button')] as HTMLButtonElement[];
    buttons.forEach(button => button.click());
    expect(vm.saveDraft).toHaveBeenCalledTimes(1);
    expect(vm.verifyReference).toHaveBeenCalledTimes(1);
    expect(vm.publishDraft).toHaveBeenCalledTimes(1);
    vm.published.set(true); fixture.detectChanges();
    expect(buttons.every(button => button.disabled)).toBeTrue();
    buttons.forEach(button => button.click());
    expect(vm.publishDraft).toHaveBeenCalledTimes(1);
  });
});
