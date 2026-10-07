import { ComparatorEditorComponent } from './comparator-editor.component';
import { JsonValueEditorComponent } from './json-value-editor.component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CodemirrorEditorComponent } from './codemirror-editor/codemirror-editor.component';
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
    ComparatorEditorComponent,
    JsonValueEditorComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    CodemirrorEditorComponent,
  ],
  template: `
    <div class="io-testcase-editor__test-case">
      <div class="io-testcase-editor__row io-testcase-editor__header">
        <mat-form-field
          appearance="outline"
          class="io-testcase-editor__name-field"
        >
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
          [attr.aria-label]="'Remove test: ' + value.name"
        >
          <mat-icon>delete</mat-icon>
        </button>
      </div>
      <ngx-comparator-editor
        [comparator]="comparator"
        [disabled]="disabled"
        (change)="updateComparator($event.key, $event.value)"
      />
      <div class="io-testcase-editor__json-grid">
        <ngx-json-value-editor
          label="Input JSON"
          caption="Input JSON — passed as one argument"
          [value]="inputJson"
          [disabled]="disabled"
          [error]="jsonErrors.inputJson"
          (valueChange)="onInputJsonChange($event)"
        />
        <ngx-json-value-editor
          label="Expected JSON"
          [value]="expectedJson"
          [disabled]="disabled"
          [error]="jsonErrors.expectedJson"
          (valueChange)="onExpectedJsonChange($event)"
        />
      </div>
      @if (showUnitTestCode) {
        <div>
          <label class="io-testcase-editor__label"
            >Optional Unit Test Code</label
          >
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
      .io-testcase-editor__test-case {
        display: grid;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
      }
      .io-testcase-editor__row {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .io-testcase-editor__header {
        justify-content: space-between;
      }
      :host,
      .io-testcase-editor__json-grid > div {
        min-width: 0;
      }
      .io-testcase-editor__name-field {
        min-width: 0;
        flex: 1;
      }
      .io-testcase-editor__comparator-row {
        flex-wrap: wrap;
      }
      .io-testcase-editor__json-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .io-testcase-editor__label {
        display: block;
        margin-bottom: 6px;
        font-size: 0.85rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .labs-journey__error {
        color: var(--mat-sys-error);
        font-size: 0.8rem;
        margin: 6px 0 0;
      }
      @media (max-width: 960px) {
        .io-testcase-editor__json-grid {
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
export class IoTestcaseEditorComponent implements ControlValueAccessor {
  @Input() language: 'typescript' | 'javascript' = 'typescript';
  @Input() showUnitTestCode = false;
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
  private readonly cdr = inject(ChangeDetectorRef);
  disabled = false;
  jsonErrors: IoTestcaseJsonError = {};

  get comparator() {
    return normalizeComparator(this.value.comparator);
  }

  private onChange: (value: LabTestCaseDto) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: LabTestCaseDto | null): void {
    this.value = {
      _id: value?._id,
      kind: 'io',
      name: value?.name ?? 'sample',
      input: value?.input,
      expected: value?.expected,
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
    this.cdr.markForCheck();
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
        : 'Enter valid JSON: an object, array, string, number, boolean or null',
      expectedJson: expectedParsed.ok
        ? undefined
        : 'Enter a valid JSON expected result',
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
