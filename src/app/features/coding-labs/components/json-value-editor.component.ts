import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CodemirrorEditorComponent } from '../../../shared/components/codemirror-editor/codemirror-editor.component';

@Component({
  selector: 'ngx-json-value-editor',
  imports: [CodemirrorEditorComponent],
  template: `
    <label class="json-value-editor__label">{{
      caption || label
    }}</label>
    <ngx-codemirror-editor
      language="json"
      [readOnly]="disabled"
      [value]="value"
      [label]="label"
      (valueChange)="valueChange.emit($event)"
    />
    @if (error) {
      <p class="json-value-editor__error" role="alert">{{ error }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .json-value-editor__label {
        display: block;
        margin-bottom: 6px;
        font-size: 0.85rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .json-value-editor__error {
        color: var(--mat-sys-error);
        font-size: 0.8rem;
        margin: 6px 0 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonValueEditorComponent {
  @Input() label = 'JSON';
  @Input() caption = '';
  @Input() value = '';
  @Input() disabled = false;
  @Input() error?: string;
  @Output() readonly valueChange = new EventEmitter<string>();
}
