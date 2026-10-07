import { TestBed } from '@angular/core/testing';
import { EditorPreviewComponent } from '../../../../../../src/app/features/coding-labs/pages/editor/editor-preview.component';

describe('Learner preview view', () => {
  it('updates with a new snapshot and sanitizes Markdown', () => {
    const fixture = TestBed.createComponent(EditorPreviewComponent);
    fixture.componentRef.setInput('title', 'Preview');
    fixture.componentRef.setInput('value', {
      promptMarkdown: '**First statement**',
      starterCode: 'first code',
      sampleTests: [],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'First statement'
    );
    fixture.componentRef.setInput('value', {
      promptMarkdown: 'Updated <img src="x" onerror="alert(1)">',
      starterCode: 'updated code',
      sampleTests: [{ name: 'Null case', input: null, expected: 0 }],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'updated code'
    );
    expect(fixture.nativeElement.textContent).toContain('Null case');
    expect(
      fixture.nativeElement
        .querySelector('img')
        ?.hasAttribute('onerror')
    ).toBeFalse();
  });
});
