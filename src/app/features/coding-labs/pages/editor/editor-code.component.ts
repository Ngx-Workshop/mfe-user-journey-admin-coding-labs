import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CodemirrorEditorComponent } from '../../components/codemirror-editor/codemirror-editor.component';
import type { EditorForm } from './editor-form';

@Component({
  selector: 'ngx-editor-code',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CodemirrorEditorComponent,
  ],
  template: `
    <div [formGroup]="form">
      <section class="labs-journey__panel">
        <div class="lab-editor__fields">
          <mat-form-field appearance="outline"
            ><mat-label>Language</mat-label>
            <mat-select formControlName="language"
              ><mat-option value="typescript">TypeScript</mat-option
              ><mat-option value="javascript"
                >JavaScript</mat-option
              ></mat-select
            >
          </mat-form-field>
          <div formGroupName="runner">
            <mat-form-field appearance="outline"
              ><mat-label>Function name</mat-label
              ><input
                matInput
                formControlName="entryFnName"
              /><mat-error
                >Enter a valid function name, such as
                solve.</mat-error
              ></mat-form-field
            >
          </div>
        </div>
        <p>
          Write a function that takes one JSON value and returns a
          JSON value. For multiple parameters, use an input object.
          Imports and installed packages are not supported.
        </p>
        <h3>Starter code <span>Learner visible</span></h3>
        <ngx-codemirror-editor
          label="Starter code"
          formControlName="starterCode"
          [language]="form.controls.language.value"
        />
        <div formGroupName="referenceSolution">
          <h3>Reference solution <span>Admin only</span></h3>
          <p>
            This implementation must pass every sample and hidden test
            before publication.
          </p>
          <ngx-codemirror-editor
            label="Reference solution"
            formControlName="code"
            [language]="form.controls.language.value"
          />
          <label for="notes">Solution notes (admin only)</label>
          <textarea
            id="notes"
            rows="4"
            formControlName="notesMarkdown"
          ></textarea>
        </div>
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
      h3 {
        font-size: 1rem;
        line-height: 1.5;
      }
      p {
        line-height: 1.6;
      }
      .labs-journey__panel {
        padding: 24px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        min-width: 0;
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
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
      h3 {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }
      h3 span {
        font-size: 0.75rem;
        font-weight: 400;
        padding: 4px 10px;
        border-radius: 20px;
        background: var(--mat-sys-surface-container-high);
      }
      .lab-editor__fields {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
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
      textarea {
        box-sizing: border-box;
        width: 100%;
        resize: vertical;
        padding: 16px;
        border: 1px solid var(--mat-sys-outline);
        border-radius: 8px;
        background: var(--mat-sys-surface);
        color: var(--mat-sys-on-surface);
        font: inherit;
        line-height: 1.6;
      }
      label {
        display: block;
        margin-top: 12px;
      }
      @media (max-width: 600px) {
        .labs-journey__panel {
          padding: 16px;
        }
      }
      .lab-editor__fields > * {
        flex: 1 1 180px;
        min-width: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorCodeComponent {
  @Input({ required: true }) form!: EditorForm;
}
