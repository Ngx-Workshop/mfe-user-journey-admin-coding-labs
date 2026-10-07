import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LabVersionEntity } from '../models/coding-labs.models';
import { entityId } from '../utils/lab-entity.utils';

@Component({
  selector: 'ngx-version-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, DatePipe],
  template: `
    @if (versions.length === 0) {
      <p class="version-list__empty">
        No versions yet. Open the editor to start the first draft.
      </p>
    } @else {
      <div
        class="labs-journey__table-wrap"
        tabindex="0"
        role="region"
        aria-label="Version history"
      >
        <table class="version-list__versions-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Status</th>
              <th>Published</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (version of versions; track trackVersion(version)) {
              <tr>
                <td>v{{ version.versionNumber }}</td>
                <td>{{ version.isDraft ? 'Draft' : 'Published' }}</td>
                <td>
                  {{
                    version.publishedAt
                      ? (version.publishedAt | date: 'mediumDate')
                      : 'Not published'
                  }}
                </td>
                <td>
                  {{
                    version.createdAt
                      ? (version.createdAt | date: 'mediumDate')
                      : 'Unknown'
                  }}
                </td>
                <td class="labs-journey__table-actions">
                  <button
                    mat-button
                    type="button"
                    (click)="view.emit(version)"
                  >
                    <mat-icon>visibility</mat-icon> View
                  </button>
                  @if (version.isDraft && !readOnly) {
                    <button
                      mat-button
                      type="button"
                      (click)="editDraft.emit(version)"
                    >
                      <mat-icon>edit</mat-icon> Edit
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        color: var(--mat-sys-on-surface);
      }
      p {
        line-height: 1.6;
      }
      :where(a, button, summary, textarea):focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 4px;
      }
      .labs-journey__table-wrap {
        min-width: 0;
        overflow-x: auto;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      th,
      td {
        padding: 16px;
        text-align: left;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
        vertical-align: middle;
      }
      th {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface-variant);
        background: var(--mat-sys-surface-container-low);
      }
      tr:last-child td {
        border-bottom: 0;
      }
      tbody tr:hover {
        background: var(--mat-sys-surface-container-low);
      }
      .labs-journey__table-actions {
        white-space: nowrap;
      }
      @media (max-width: 700px) {
        th,
        td {
          padding: 12px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionListComponent {
  @Input() versions: LabVersionEntity[] = [];

  @Output() readonly view = new EventEmitter<LabVersionEntity>();
  @Output() readonly editDraft = new EventEmitter<LabVersionEntity>();
  @Input() readOnly = false;

  trackVersion(version: LabVersionEntity): string {
    return entityId(version);
  }
}
