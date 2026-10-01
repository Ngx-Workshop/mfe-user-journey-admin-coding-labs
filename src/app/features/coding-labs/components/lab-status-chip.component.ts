import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { LabStatus } from '../models/coding-labs.models';

@Component({
  selector: 'ngx-lab-status-chip',
  standalone: true,
  imports: [TitleCasePipe],
  template: `
    <span class="status" [class]="statusClass">{{
      status | titlecase
    }}</span>
  `,
  styles: [
    `
      .status {
        display: inline-block;
        white-space: nowrap;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .status-draft {
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }
      .status-published {
        background: var(--mat-sys-tertiary-container);
        color: var(--mat-sys-on-tertiary-container);
      }
      .status-archived {
        background: var(--mat-sys-surface-container-highest);
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabStatusChipComponent {
  @Input() status: LabStatus = 'draft';

  get statusClass(): string {
    return `status-${this.status}`;
  }
}
