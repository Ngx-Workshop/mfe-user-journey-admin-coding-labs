import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { IoTestcaseEditorComponent } from './io-testcase-editor.component';

describe('Input/output test editor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [IoTestcaseEditorComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
      ],
    })
  );
  it('preserves null and the case identity through editing', async () => {
    const fixture = TestBed.createComponent(
      IoTestcaseEditorComponent
    );
    const editor = fixture.componentInstance;
    editor.writeValue({
      _id: 'case-1',
      name: 'Null',
      kind: 'io',
      input: null,
      expected: false,
      comparator: { kind: 'deepEqual' },
    });
    const changes = jasmine.createSpy('changes');
    editor.registerOnChange(changes);
    editor.onExpectedJsonChange('0');
    expect(changes).toHaveBeenCalledWith(
      jasmine.objectContaining({
        _id: 'case-1',
        input: null,
        expected: 0,
      })
    );
  });
  it('reports malformed input while preserving the displayed text', () => {
    const fixture = TestBed.createComponent(
      IoTestcaseEditorComponent
    );
    const editor = fixture.componentInstance;
    const errors = jasmine.createSpy('errors');
    editor.jsonErrorsChange.subscribe(errors);
    editor.onInputJsonChange('{ broken');
    expect(editor.inputJson).toBe('{ broken');
    expect(errors).toHaveBeenCalledWith(
      jasmine.objectContaining({ inputJson: jasmine.any(String) })
    );
  });
  it('disables its controls when the parent is publishing', async () => {
    const fixture = TestBed.createComponent(
      IoTestcaseEditorComponent
    );
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('input').disabled
    ).toBeTrue();
    expect(
      fixture.nativeElement.querySelector('button').disabled
    ).toBeTrue();
  });
});
