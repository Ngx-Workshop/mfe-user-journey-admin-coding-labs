import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IoTestcaseEditorComponent } from '../../components/io-testcase-editor.component';
import type { EditorForm } from './editor-form';

@Component({
  selector: 'ngx-editor-tests',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    IoTestcaseEditorComponent,
  ],
  template: `
    <div [formGroup]="form">
      <section class="labs-journey__panel">
        <h2>Prove the solution</h2>
        <p>
          Inputs and expected results accept any JSON value, including
          numbers, strings, arrays, booleans and null. Use deep
          equality for objects and arrays.
        </p>
        <h3>
          Sample tests
          <span>{{ sampleTests.length }} · Learner visible</span>
        </h3>
        @for (
          ctrl of sampleTests.controls;
          track ctrl;
          let i = $index
        ) {
          @if (ctrl.value.kind === 'io') {
            <ngx-io-testcase-editor
              [formControl]="ctrl"
              [language]="form.controls.language.value"
              (remove)="remove.emit({ suite: 'sample', index: i })"
              (jsonErrorsChange)="
                jsonErrors.emit({
                  suite: 'sample',
                  index: i,
                  errors: $event,
                })
              "
            />
          } @else {
            <p role="alert">
              Legacy unit test: {{ ctrl.value.name }}. Replace it with
              an input/output test.
            </p>
            <button
              mat-button
              type="button"
              (click)="remove.emit({ suite: 'sample', index: i })"
              [disabled]="disabled"
            >
              Remove legacy sample test
            </button>
          }
        }
        <button
          mat-stroked-button
          type="button"
          (click)="add.emit('sample')"
          [disabled]="disabled"
        >
          Add sample test
        </button>
        <h3>
          Hidden tests
          <span>{{ hiddenTests.length }} · Admin only</span>
        </h3>
        <p>
          Include edge cases: empty inputs, boundary values,
          duplicates, and negative numbers.
        </p>
        @for (
          ctrl of hiddenTests.controls;
          track ctrl;
          let i = $index
        ) {
          @if (ctrl.value.kind === 'io') {
            <ngx-io-testcase-editor
              [formControl]="ctrl"
              [language]="form.controls.language.value"
              (remove)="remove.emit({ suite: 'hidden', index: i })"
              (jsonErrorsChange)="
                jsonErrors.emit({
                  suite: 'hidden',
                  index: i,
                  errors: $event,
                })
              "
            />
          } @else {
            <p role="alert">
              Legacy unit test: {{ ctrl.value.name }}. Replace it with
              an input/output test.
            </p>
            <button
              mat-button
              type="button"
              (click)="remove.emit({ suite: 'hidden', index: i })"
              [disabled]="disabled"
            >
              Remove legacy hidden test
            </button>
          }
        }
        <button
          mat-stroked-button
          type="button"
          (click)="add.emit('hidden')"
          [disabled]="disabled"
        >
          Add hidden test
        </button>
        <h3>Execution limits</h3>
        <div class="lab-editor__fields" formGroupName="runner">
          <mat-form-field appearance="outline"
            ><mat-label>Timeout per case (ms)</mat-label
            ><input
              matInput
              type="number"
              min="100"
              max="10000"
              formControlName="timeoutMs"
            /><mat-error
              >Use 100–10,000 ms.</mat-error
            ></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>Memory per case (MB)</mat-label
            ><input
              matInput
              type="number"
              min="64"
              max="512"
              formControlName="memoryMb"
            /><mat-error>Use 64–512 MB.</mat-error></mat-form-field
          >
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
export class EditorTestsComponent {
  @Input() disabled = false;
  @Input({ required: true }) form!: EditorForm;
  @Output() readonly add = new EventEmitter<'sample' | 'hidden'>();
  @Output() readonly remove = new EventEmitter<{
    suite: 'sample' | 'hidden';
    index: number;
  }>();
  @Output() readonly jsonErrors = new EventEmitter<{
    suite: 'sample' | 'hidden';
    index: number;
    errors: { inputJson?: string; expectedJson?: string };
  }>();
  get sampleTests() {
    return this.form.controls.sampleTests;
  }
  get hiddenTests() {
    return this.form.controls.hiddenTests;
  }
}
