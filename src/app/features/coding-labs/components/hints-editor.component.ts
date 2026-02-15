import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
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

@Component({
  selector: 'ngx-hints-editor',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    <div class="hints">
      @for (hint of hints; track $index) {
        <div class="row">
          <mat-form-field appearance="outline" class="field">
            <mat-label>Hint {{ $index + 1 }}</mat-label>
            <input
              matInput
              [ngModel]="hint"
              (ngModelChange)="updateHint($index, $event)"
              [disabled]="disabled"
            />
          </mat-form-field>
          <button mat-icon-button type="button" (click)="move($index, -1)" [disabled]="disabled || $index === 0">
            <mat-icon>arrow_upward</mat-icon>
          </button>
          <button mat-icon-button type="button" (click)="move($index, 1)" [disabled]="disabled || $index === hints.length - 1">
            <mat-icon>arrow_downward</mat-icon>
          </button>
          <button mat-icon-button type="button" (click)="removeHint($index)" [disabled]="disabled">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      }
      <button mat-stroked-button type="button" (click)="addHint()" [disabled]="disabled">
        <mat-icon>add</mat-icon>
        Add Hint
      </button>
    </div>
  `,
  styles: [
    `
      .hints {
        display: grid;
        gap: 8px;
      }

      .row {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        gap: 8px;
        align-items: center;
      }

      .field {
        width: 100%;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HintsEditorComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HintsEditorComponent implements ControlValueAccessor {
  hints: string[] = [];
  disabled = false;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.hints = value?.slice() ?? [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  addHint(): void {
    this.hints = [...this.hints, ''];
    this.emit();
  }

  removeHint(index: number): void {
    this.hints = this.hints.filter((_, i) => i !== index);
    this.emit();
  }

  updateHint(index: number, value: string): void {
    this.hints = this.hints.map((hint, i) =>
      i === index ? value : hint
    );
    this.emit();
  }

  move(index: number, direction: -1 | 1): void {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= this.hints.length) return;

    const next = this.hints.slice();
    const current = next[index];
    next[index] = next[nextIndex];
    next[nextIndex] = current;
    this.hints = next;
    this.emit();
  }

  private emit(): void {
    this.onChange(this.hints.map((hint) => hint.trim()).filter(Boolean));
    this.onTouched();
  }
}
