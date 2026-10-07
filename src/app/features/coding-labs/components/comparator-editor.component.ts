import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ComparatorDto } from '../models/coding-labs.models';

@Component({
  selector: 'ngx-comparator-editor',
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="comparator-editor__fields">
      <mat-form-field appearance="outline">
        <mat-label>Comparator</mat-label>
        <mat-select
          [ngModel]="comparator.kind"
          (ngModelChange)="update('kind', $event)"
          [disabled]="disabled"
        >
          <mat-option value="strictEqual">Exact value</mat-option>
          <mat-option value="deepEqual"
            >Deep equality (objects and arrays)</mat-option
          >
          <mat-option value="stringNormalized"
            >Normalized text</mat-option
          >
          <mat-option value="numberTolerance"
            >Number within tolerance</mat-option
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
            (ngModelChange)="update('tolerance', +$event)"
            [disabled]="disabled"
          />
        </mat-form-field>
      }
      @if (comparator.kind === 'stringNormalized') {
        <mat-checkbox
          [ngModel]="comparator.normalizeWhitespace ?? false"
          (ngModelChange)="update('normalizeWhitespace', $event)"
          [disabled]="disabled"
        >
          Normalize whitespace
        </mat-checkbox>
        <mat-checkbox
          [ngModel]="comparator.ignoreCase ?? false"
          (ngModelChange)="update('ignoreCase', $event)"
          [disabled]="disabled"
        >
          Ignore case
        </mat-checkbox>
      }
    </div>
  `,
  styles: [
    `
      .comparator-editor__fields {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparatorEditorComponent {
  @Input({ required: true }) comparator!: ComparatorDto;
  @Input() disabled = false;
  @Output() readonly change = new EventEmitter<{
    key: keyof ComparatorDto;
    value: unknown;
  }>();
  update(key: keyof ComparatorDto, value: unknown) {
    this.change.emit({ key, value });
  }
}
