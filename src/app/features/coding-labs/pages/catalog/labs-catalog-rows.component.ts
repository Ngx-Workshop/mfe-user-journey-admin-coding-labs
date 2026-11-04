import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LabStatusChipComponent } from '../../components/lab-status-chip.component';
import { LabEntity } from '../../models/coding-labs.models';
import { entityId, labStatus } from '../../utils/lab-entity.utils';
@Component({
  selector: 'ngx-labs-catalog-rows',
  imports: [DatePipe, TitleCasePipe, RouterLink, MatButtonModule, MatIconModule, LabStatusChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="labs-rows" aria-label="Coding labs results">
      @for (lab of labs(); track id(lab)) {
        <li class="labs-rows__row">
          <a class="labs-rows__open" [routerLink]="[id(lab)]" [attr.aria-label]="'Open ' + lab.title">
            <strong>{{ lab.title || 'Untitled lab' }}</strong>
            <span>{{ (lab.difficulty | titlecase) || 'Not set' }} · {{ lab.estimatedMinutes ? lab.estimatedMinutes + ' min' : 'Duration not set' }} · {{ lab.updatedAt ? (lab.updatedAt | date: 'mediumDate') : 'Not yet saved' }}</span>
            @if ((lab.tags || []).length) { <small>{{ (lab.tags || []).join(' · ') }}</small> }
          </a>
          <ngx-lab-status-chip [status]="status(lab)" />
          @if (status(lab) !== 'archived') {
            <button mat-icon-button type="button" (click)="archive.emit(lab)" [disabled]="!!archivingId()" [attr.aria-label]="'Archive ' + lab.title" [title]="archivingId() === id(lab) ? 'Archiving…' : 'Archive lab'"><mat-icon>archive</mat-icon></button>
          }
        </li>
      }
    </ul>
  `,
  styles: [`
    .labs-rows { list-style: none; padding: 0; margin: 0; }
    .labs-rows__row { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--ngx-color-border); background: var(--ngx-color-surface); padding: 4px 8px; min-width: 0; }
    .labs-rows__open { flex: 1; min-width: 0; display: grid; gap: 3px; padding: 6px 0; color: var(--ngx-color-text); text-decoration: none; }
    .labs-rows__open strong { font-family: var(--ngx-font-heading); font-size: 0.8rem; overflow-wrap: anywhere; }
    .labs-rows__open span, small { font-size: 0.65rem; color: var(--ngx-color-muted); }
    .labs-rows__open:hover strong { color: var(--ngx-color-primary); }
    .labs-rows__open:focus-visible { outline: 2px solid var(--ngx-color-primary); }
    @media (max-width: 600px) { .labs-rows__row { flex-wrap: wrap; } .labs-rows__open { flex-basis: 100%; } }
  `],
})
export class LabsCatalogRowsComponent {
  readonly labs = input.required<LabEntity[]>(); readonly archivingId = input<string | null>('');
  readonly archive = output<LabEntity>(); readonly id = entityId; readonly status = labStatus;
}
