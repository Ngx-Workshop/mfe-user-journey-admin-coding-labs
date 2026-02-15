import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'ngx-tags-chips-editor',
  standalone: true,
  imports: [
    FormsModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="tags-field">
      <mat-label>{{ label }}</mat-label>
      <mat-chip-grid #chipGrid>
        @for (tag of tags; track tag) {
          <mat-chip-row (removed)="removeTag(tag)">
            {{ tag }}
            <button matChipRemove type="button" [disabled]="disabled">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
        }
      </mat-chip-grid>
      <input
        matInput
        [placeholder]="placeholder"
        [matChipInputFor]="chipGrid"
        (matChipInputTokenEnd)="addTagFromEvent($event)"
        [disabled]="disabled"
      />
    </mat-form-field>
  `,
  styles: [
    `
      .tags-field {
        width: 100%;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagsChipsEditorComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsChipsEditorComponent
  implements ControlValueAccessor
{
  @Input() label = 'Tags';
  @Input() placeholder = 'Add tag';

  tags: string[] = [];
  disabled = false;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.tags = value?.filter(Boolean) ?? [];
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

  addTagFromEvent(event: MatChipInputEvent): void {
    const next = event.value?.trim();
    if (!next) return;
    if (!this.tags.includes(next)) {
      this.tags = [...this.tags, next];
      this.onChange(this.tags);
      this.onTouched();
    }
    event.chipInput?.clear();
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((item) => item !== tag);
    this.onChange(this.tags);
    this.onTouched();
  }
}
