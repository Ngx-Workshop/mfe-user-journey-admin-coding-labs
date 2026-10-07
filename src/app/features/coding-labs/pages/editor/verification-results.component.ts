import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { VerificationDto } from '../../models/coding-labs.models';
@Component({
  selector: 'ngx-verification-results',
  imports: [JsonPipe],
  template: `
    @if (verification; as run) {
      <section
        class="lab-editor__results"
        aria-label="Verification results"
      >
        <h2>Verification results</h2>
        <p role="status">
          {{ run.passedTests }} of {{ run.totalTests }} tests passed ·
          {{ run.durationMs }} ms
        </p>
        @for (result of run.results; track $index) {
          <details [open]="result.status !== 'passed'">
            <summary>
              <span
                class="lab-editor__result-status"
                [class.lab-editor__result--failed]="
                  result.status !== 'passed'
                "
                >{{ result.status }}</span
              >
              {{ result.name }} · {{ result.suite }} ·
              {{ result.durationMs }} ms
            </summary>
            @if (result.message) {
              <p>{{ result.message }}</p>
            }
            <div class="lab-editor__result-values">
              <div>
                <strong>Expected</strong>
                <pre>{{ result.expected | json }}</pre>
              </div>
              <div>
                <strong>Actual</strong>
                <pre>{{ result.actual | json }}</pre>
              </div>
            </div>
          </details>
        }
      </section>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        color: var(--mat-sys-on-surface);
      }
      h2 {
        margin: 0 0 12px;
        font-size: 1.3rem;
        line-height: 1.4;
      }
      p {
        line-height: 1.6;
      }
      pre {
        box-sizing: border-box;
        max-width: 100%;
        overflow: auto;
        padding: 16px;
        border-radius: 10px;
        background: var(--mat-sys-surface-container-low);
        font-size: 0.875rem;
        line-height: 1.6;
      }
      details {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;
        padding: 16px;
        min-width: 0;
      }
      summary {
        cursor: pointer;
        font-weight: 600;
        line-height: 1.6;
      }
      :where(a, button, summary, textarea):focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 4px;
      }
      :host {
        display: block;
      }
      h2 {
        margin: 0;
        font-size: 1.4rem;
      }
      pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        background: var(--mat-sys-surface-container-low);
        border-radius: 8px;
        padding: 16px;
        margin: 8px 0;
      }
      .lab-editor__results {
        margin: 28px 0;
        display: grid;
        gap: 12px;
      }
      details {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 10px;
        padding: 16px;
      }
      summary {
        cursor: pointer;
        line-height: 1.8;
      }
      .lab-editor__result-status {
        text-transform: uppercase;
        font-size: 0.75rem;
        font-weight: 700;
        margin: 0 12px;
        color: var(--mat-sys-primary);
      }
      .lab-editor__result--failed {
        color: var(--mat-sys-error);
      }
      .lab-editor__result-values {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 16px;
      }
      @media (max-width: 600px) {
        .lab-editor__result-values {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationResultsComponent {
  @Input() verification: VerificationDto | null = null;
}
