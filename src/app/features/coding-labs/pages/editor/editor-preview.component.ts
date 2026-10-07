import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { marked } from 'marked';
import type { LearnerPreview } from './editor-form';

@Component({
  selector: 'ngx-editor-preview',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div>
      <section class="labs-journey__panel lab-editor__preview">
        <p class="labs-journey__eyebrow">
          LEARNER CONTENT · HIDDEN TESTS AND SOLUTION EXCLUDED
        </p>
        <h2>{{ title }}</h2>
        <div
          class="lab-editor__statement-preview"
          [innerHTML]="markdown()"
        ></div>
        <h3>Starter code</h3>
        <pre>{{ value.starterCode }}</pre>
        <h3>Examples</h3>
        @for (test of value.sampleTests; track $index) {
          <article>
            <strong>{{ test.name }}</strong>
            <p>Input</p>
            <pre>{{ test.input | json }}</pre>
            <p>Expected result</p>
            <pre>{{ test.expected | json }}</pre>
          </article>
        }
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        color: var(--mat-sys-on-surface);
      }
      h1 {
        margin: 6px 0 12px;
        font-size: clamp(1.65rem, 2.5vw, 2.2rem);
        line-height: 1.25;
        overflow-wrap: anywhere;
      }
      h2 {
        margin: 0 0 12px;
        font-size: 1.3rem;
        line-height: 1.4;
      }
      h3 {
        font-size: 1rem;
        line-height: 1.5;
      }
      p {
        line-height: 1.6;
      }
      .labs-journey__eyebrow {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: var(--mat-sys-primary);
        text-transform: uppercase;
      }
      .labs-journey__panel {
        padding: 24px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        min-width: 0;
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
      :where(a, button, summary, textarea):focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 4px;
      }
      @media (max-width: 700px) {
        .labs-journey__panel {
          padding: 16px;
        }
      }
      :host {
        display: block;
      }
      h2 {
        margin: 0;
        font-size: 1.4rem;
      }
      h3 {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }
      .labs-journey__eyebrow {
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        color: var(--mat-sys-primary);
        font-weight: 600;
      }
      .labs-journey__panel {
        border: 0;
        border-radius: 0;
        display: grid;
        gap: 16px;
        padding: 24px;
      }
      .labs-journey__panel > p {
        margin: 0;
        line-height: 1.6;
        color: var(--mat-sys-on-surface-variant);
      }
      .labs-journey__panel > button {
        justify-self: start;
      }
      pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        background: var(--mat-sys-surface-container-low);
        border-radius: 8px;
        padding: 16px;
        margin: 8px 0;
      }
      .lab-editor__statement-preview {
        font: inherit;
        line-height: 1.7;
      }
      @media (max-width: 600px) {
        .labs-journey__panel {
          padding: 16px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPreviewComponent {
  @Input({ required: true }) value!: LearnerPreview;
  @Input() title = '';
  markdown() {
    return marked.parse(this.value.promptMarkdown, { async: false });
  }
}
