import { NgxCodeBlock } from '@tmdjr/ngx-workshop-design-system';
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
  imports: [NgxCodeBlock,JsonPipe],
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
        <ngx-code-block [code]="value.starterCode" [language]="language" [wrap]="true" />
        <h3>Examples</h3>
        @for (test of value.sampleTests; track $index) {
          <article>
            <strong>{{ test.name }}</strong>
            <p>Input</p>
            <ngx-code-block [code]="(test.input | json) || 'null'" language="json" [wrap]="true" />
            <p>Expected result</p>
            <ngx-code-block [code]="(test.expected | json) || 'null'" language="json" [wrap]="true" />
          </article>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .labs-journey__panel > * { min-width: 0; max-width: 100%; }
      :host {
        display: block;
        min-width: 0;
        color: var(--ngx-color-text);
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
        color: var(--ngx-color-primary);
        text-transform: uppercase;
      }
      .labs-journey__panel {
        padding: 0;
        border: 1px solid var(--ngx-color-border);
        border-radius: 16px;
        min-width: 0;
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
      :where(a, button, summary, textarea):focus-visible {
        outline: 2px solid var(--ngx-color-primary);
        outline-offset: 4px;
      }
      @media (max-width: 700px) {
        .labs-journey__panel {
          padding: 8px;
        }
      }
      :host {
        display: block;
      }
      h2 {
        margin: 0;
        font-size: 1rem;
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
        color: var(--ngx-color-primary);
        font-weight: 600;
      }
      .labs-journey__panel {
        border: 0;
        border-radius: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
        padding: 0;
      }
      .labs-journey__panel > p {
        margin: 0;
        line-height: 1.6;
        color: var(--ngx-color-muted);
      }
      .labs-journey__panel > button {
        justify-self: start;
      }
      pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        background: var(--ngx-color-surface);
        border-radius: 8px;
        padding: 8px;
        margin: 8px 0;
      }
      .lab-editor__statement-preview {
        font: inherit;
        line-height: 1.7;
      }
      @media (max-width: 600px) {
        .labs-journey__panel {
          padding: 8px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPreviewComponent {
  @Input({ required: true }) value!: LearnerPreview;
  @Input() title = '';
  @Input() language: 'typescript' | 'javascript' = 'typescript';
  markdown() {
    return marked.parse(this.value.promptMarkdown, { async: false });
  }
}
