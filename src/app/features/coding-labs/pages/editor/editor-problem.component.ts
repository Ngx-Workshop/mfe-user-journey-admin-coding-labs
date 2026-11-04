import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HintsEditorComponent } from '../../components/hints-editor.component';
import type { EditorForm } from './editor-form';

@Component({
  selector: 'ngx-editor-problem',
  standalone: true,
  imports: [ReactiveFormsModule, HintsEditorComponent],
  template: `
    <div [formGroup]="form">
      <section class="labs-journey__panel">
        <h2>Define the challenge</h2>
        <p>
          Explain the goal, show an example, and state the
          constraints. This is what learners will see.
        </p>
        <label for="statement">Problem statement (Markdown)</label>
        <textarea
          id="statement"
          rows="9"
          formControlName="promptMarkdown"
        ></textarea>
        <h3>Progressive hints</h3>
        <p>
          Optional. Add hints from a gentle nudge to a more specific
          approach.
        </p>
        <ngx-hints-editor formControlName="hints" />
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
      .labs-journey__panel {
        padding: 0;
        border: 1px solid var(--ngx-color-border);
        border-radius: 16px;
        min-width: 0;
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
      textarea {
        box-sizing: border-box;
        width: 100%;
        resize: vertical;
        padding: 8px;
        border: 1px solid var(--ngx-color-border);
        border-radius: 8px;
        background: var(--ngx-color-surface);
        color: var(--ngx-color-text);
        font: inherit;
        line-height: 1.6;
      }
      label {
        display: block;
        margin-top: 12px;
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
export class EditorProblemComponent {
  @Input({ required: true }) form!: EditorForm;
}
