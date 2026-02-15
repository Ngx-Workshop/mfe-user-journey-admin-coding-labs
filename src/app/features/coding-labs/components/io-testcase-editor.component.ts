import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CodemirrorEditorComponent } from '../../../shared/components/codemirror-editor/codemirror-editor.component';
import { LabTestCaseDto } from '../models/coding-labs.models';
import {
  formatJson,
  normalizeComparator,
  tryParseJson,
} from '../utils/coding-labs-form.utils';

interface IoTestcaseJsonError {
  inputJson?: string;
  expectedJson?: string;
}

@Component({
  selector: 'ngx-io-testcase-editor',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    CodemirrorEditorComponent,
  ],
  template: `
    <div class="test-case">
      <div class="row header">
        <mat-form-field appearance="outline" class="name-field">
          <mat-label>Test name</mat-label>
          <input
            matInput
            [ngModel]="value.name"
            (ngModelChange)="onNameChange($event)"
            [disabled]="disabled"
          />
        </mat-form-field>

        <button
          mat-icon-button
          type="button"
          (click)="remove.emit()"
          [disabled]="disabled"
          aria-label="Remove testcase"
        >
          <mat-icon>delete</mat-icon>
        </button>
      </div>

      <div class="row comparator-row">
        <mat-form-field appearance="outline">
          <mat-label>Comparator</mat-label>
          <mat-select
            [ngModel]="comparator.kind"
            (ngModelChange)="updateComparator('kind', $event)"
            [disabled]="disabled"
          >
            <mat-option value="strictEqual">strictEqual</mat-option>
            <mat-option value="deepEqual">deepEqual</mat-option>
            <mat-option value="stringNormalized"
              >stringNormalized</mat-option
            >
            <mat-option value="numberTolerance"
              >numberTolerance</mat-option
            >
          </mat-select>
        </mat-form-field>

        @if (comparator.kind === 'numberTolerance') {
        <mat-form-field appearance="outline">
          <mat-label>Tolerance</mat-label>
          <input
            matInput
            type="number"
            [ngModel]="comparator.tolerance ?? 0"
            (ngModelChange)="updateComparator('tolerance', +$event)"
            [disabled]="disabled"
          />
        </mat-form-field>
        }

        <mat-checkbox
          [ngModel]="comparator.normalizeWhitespace ?? false"
          (ngModelChange)="
            updateComparator('normalizeWhitespace', $event)
          "
          [disabled]="disabled"
        >
          Normalize whitespace
        </mat-checkbox>

        <mat-checkbox
          [ngModel]="comparator.ignoreCase ?? false"
          (ngModelChange)="updateComparator('ignoreCase', $event)"
          [disabled]="disabled"
        >
          Ignore case
        </mat-checkbox>
      </div>

      <div class="json-grid">
        <div>
          <label class="label">Input JSON</label>
          <ngx-codemirror-editor
            [language]="'json'"
            [readOnly]="disabled"
            [value]="inputJson"
            (valueChange)="onInputJsonChange($event)"
          ></ngx-codemirror-editor>
          @if (jsonErrors.inputJson) {
          <p class="error">{{ jsonErrors.inputJson }}</p>
          }
        </div>

        <div>
          <label class="label">Expected JSON</label>
          <ngx-codemirror-editor
            [language]="'json'"
            [readOnly]="disabled"
            [value]="expectedJson"
            (valueChange)="onExpectedJsonChange($event)"
          ></ngx-codemirror-editor>
          @if (jsonErrors.expectedJson) {
          <p class="error">{{ jsonErrors.expectedJson }}</p>
          }
        </div>
      </div>

      @if (showUnitTestCode) {
      <div>
        <label class="label">Optional Unit Test Code</label>
        <ngx-codemirror-editor
          [language]="language"
          [readOnly]="disabled"
          [value]="value.testCode ?? ''"
          (valueChange)="update('testCode', $event)"
        ></ngx-codemirror-editor>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .test-case {
        display: grid;
        gap: 12px;
        padding: 12px;
        border: 1px solid #dce1ea;
        border-radius: 8px;
      }

      .row {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .header {
        justify-content: space-between;
      }

      .name-field {
        flex: 1;
      }

      .comparator-row {
        flex-wrap: wrap;
      }

      .json-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .label {
        display: block;
        margin-bottom: 6px;
        font-size: 0.85rem;
        color: #4f5968;
      }

      .error {
        color: #b3261e;
        font-size: 0.8rem;
        margin: 6px 0 0;
      }

      @media (max-width: 960px) {
        .json-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IoTestcaseEditorComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IoTestcaseEditorComponent
  implements ControlValueAccessor
{
  @Input() language: 'typescript' | 'javascript' = 'typescript';
  @Input() showUnitTestCode = true;
  @Output() readonly remove = new EventEmitter<void>();
  @Output() readonly jsonErrorsChange =
    new EventEmitter<IoTestcaseJsonError>();

  value: LabTestCaseDto = {
    kind: 'io',
    name: 'sample',
    input: {},
    expected: {},
    comparator: {
      kind: 'deepEqual',
      normalizeWhitespace: false,
      ignoreCase: false,
    },
  };

  inputJson = '{}';
  expectedJson = '{}';
  disabled = false;
  jsonErrors: IoTestcaseJsonError = {};

  get comparator() {
    return normalizeComparator(this.value.comparator);
  }

  private onChange: (value: LabTestCaseDto) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: LabTestCaseDto | null): void {
    this.value = {
      kind: 'io',
      name: value?.name ?? 'sample',
      input: value?.input ?? {},
      expected: value?.expected ?? {},
      comparator: normalizeComparator(value?.comparator),
      framework: value?.framework,
      testCode: value?.testCode,
    };
    this.inputJson = formatJson(this.value.input);
    this.expectedJson = formatJson(this.value.expected);
    this.validateJson(false);
  }

  registerOnChange(fn: (value: LabTestCaseDto) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onNameChange(name: string): void {
    this.update('name', name);
  }

  onInputJsonChange(value: string): void {
    this.inputJson = value;
    this.validateJson(true);
  }

  onExpectedJsonChange(value: string): void {
    this.expectedJson = value;
    this.validateJson(true);
  }

  updateComparator(
    key: keyof NonNullable<LabTestCaseDto['comparator']>,
    value: unknown
  ): void {
    const comparator = {
      ...this.comparator,
      [key]: value,
    };
    this.update('comparator', comparator);
  }

  update<K extends keyof LabTestCaseDto>(
    key: K,
    value: LabTestCaseDto[K]
  ): void {
    this.value = {
      ...this.value,
      [key]: value,
      kind: 'io',
    };
    this.emit();
  }

  private validateJson(emit = true): void {
    const inputParsed = tryParseJson(this.inputJson);
    const expectedParsed = tryParseJson(this.expectedJson);

    this.jsonErrors = {
      inputJson: inputParsed.ok
        ? undefined
        : 'Input must be valid JSON object',
      expectedJson: expectedParsed.ok
        ? undefined
        : 'Expected must be valid JSON object',
    };

    this.jsonErrorsChange.emit(this.jsonErrors);

    if (inputParsed.ok) {
      this.value = { ...this.value, input: inputParsed.parsed };
    }

    if (expectedParsed.ok) {
      this.value = {
        ...this.value,
        expected: expectedParsed.parsed,
      };
    }

    if (emit) {
      this.emit();
    }
  }

  private emit(): void {
    this.onChange({ ...this.value, kind: 'io' });
    this.onTouched();
  }
}
