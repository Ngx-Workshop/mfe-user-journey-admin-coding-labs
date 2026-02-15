import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { LabStatus } from '../models/coding-labs.models';

@Component({
  selector: 'ngx-lab-status-chip',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <mat-chip [class]="statusClass">{{ status }}</mat-chip>
  `,
  styles: [
    `
      mat-chip.status-draft {
        background: #e9f2ff;
        color: #10467a;
      }

      mat-chip.status-published {
        background: #e8f8ef;
        color: #0d6a34;
      }

      mat-chip.status-archived {
        background: #f2f3f5;
        color: #4f5968;
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
