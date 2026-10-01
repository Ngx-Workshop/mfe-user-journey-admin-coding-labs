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
      <p class="empty">
        No versions yet. Open the editor to start the first draft.
      </p>
    } @else {
      <div
        class="table-wrap"
        tabindex="0"
        role="region"
        aria-label="Version history"
      >
        <table class="versions-table">
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
                <td class="table-actions">
                  <button
                    mat-button
                    type="button"
                    (click)="view.emit(version)"
                  >
                    <mat-icon>visibility</mat-icon>
                    View
                  </button>
                  @if (version.isDraft && !readOnly) {
                    <button
                      mat-button
                      type="button"
                      (click)="editDraft.emit(version)"
                    >
                      <mat-icon>edit</mat-icon>
                      Edit
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
  styleUrls: ['../pages/journey.scss'],
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
