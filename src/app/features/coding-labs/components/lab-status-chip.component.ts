import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgxInlineStatus } from '@tmdjr/ngx-workshop-design-system';
import { LabStatus } from '../models/coding-labs.models';
@Component({
  selector: 'ngx-lab-status-chip', imports: [NgxInlineStatus],
  template: `<ngx-inline-status [label]="status === 'published' ? 'Published' : status === 'archived' ? 'Archived' : 'Draft'" [tone]="status === 'published' ? 'success' : status === 'draft' ? 'warning' : 'neutral'" />`,
  styles: [`:host { display: inline-block; white-space: nowrap; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabStatusChipComponent { @Input() status: LabStatus = 'draft'; }
