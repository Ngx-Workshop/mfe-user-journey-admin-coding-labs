import { NgxCodeBlock } from '@tmdjr/ngx-workshop-design-system';
import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { VerificationDto } from '../../models/coding-labs.models';
@Component({
  selector: 'ngx-verification-results',
  imports: [NgxCodeBlock,JsonPipe],
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
                <ngx-code-block [code]="(result.expected | json) || 'null'" language="json" [wrap]="true" />
              </div>
              <div>
                <strong>Actual</strong>
                <ngx-code-block [code]="(result.actual | json) || 'null'" language="json" [wrap]="true" />
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
        color: var(--ngx-color-text);
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
        padding: 8px;
        border-radius: 10px;
        background: var(--ngx-color-surface);
        font-size: 0.875rem;
        line-height: 1.6;
      }
      details {
        border: 1px solid var(--ngx-color-border);
        border-radius: 12px;
        padding: 8px;
        min-width: 0;
      }
      summary {
        cursor: pointer;
        font-weight: 600;
        line-height: 1.6;
      }
      :where(a, button, summary, textarea):focus-visible {
        outline: 2px solid var(--ngx-color-primary);
        outline-offset: 4px;
      }
      :host {
        display: block;
      }
      h2 {
        margin: 0;
        font-size: 1rem;
      }
      pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        background: var(--ngx-color-surface);
        border-radius: 8px;
        padding: 8px;
        margin: 8px 0;
      }
      .lab-editor__results {
        margin: 8px 0;
        display: grid;
        gap: 12px;
      }
      details {
        border: 1px solid var(--ngx-color-border);
        border-radius: 10px;
        padding: 8px;
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
        color: var(--ngx-color-primary);
      }
      .lab-editor__result--failed {
        color: var(--ngx-color-error);
      }
      .lab-editor__result-values {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
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
