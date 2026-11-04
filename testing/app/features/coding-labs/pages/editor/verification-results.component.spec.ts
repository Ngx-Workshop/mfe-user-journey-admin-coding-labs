import { TestBed } from '@angular/core/testing';
import { VerificationResultsComponent } from '../../../../../../src/app/features/coding-labs/pages/editor/verification-results.component';

describe('Verification result code blocks', () => {
  it('displays false and null values without interpreting returned text as HTML', () => {
    const fixture = TestBed.createComponent(VerificationResultsComponent);
    fixture.componentRef.setInput('verification', {
      passed: false, passedTests: 0, totalTests: 2, durationMs: 12,
      results: [
        { name: 'Falsy values', suite: 'sample', status: 'failed', durationMs: 6, expected: false, actual: null },
        { name: 'Text result', suite: 'hidden', status: 'failed', durationMs: 6, expected: 0, actual: '<img src=x onerror=alert(1)>' },
      ],
    });
    fixture.detectChanges();
    const code = [...fixture.nativeElement.querySelectorAll('ngx-code-block code')].map((element: any) => element.textContent);
    expect(code).toEqual(['false', 'null', '0', '"<img src=x onerror=alert(1)>"']);
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('details[open]').length).toBe(2);
  });
});
