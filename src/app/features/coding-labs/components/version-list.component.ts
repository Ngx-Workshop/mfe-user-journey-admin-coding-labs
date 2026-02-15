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
  imports: [MatButtonModule, MatIconModule],
  template: `
    @if (versions.length === 0) {
      <p class="empty">No versions yet.</p>
    } @else {
      <table class="versions-table">
        <thead>
          <tr>
            <th>Version</th>
            <th>Draft</th>
            <th>Published</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (version of versions; track trackVersion(version)) {
            <tr>
              <td>v{{ version.versionNumber ?? '?' }}</td>
              <td>{{ version.isDraft ? 'Yes' : 'No' }}</td>
              <td>{{ version.publishedAt || '-' }}</td>
              <td>{{ version.createdAt || '-' }}</td>
              <td class="actions">
                <button mat-button type="button" (click)="view.emit(version)">
                  <mat-icon>visibility</mat-icon>
                  View
                </button>
                @if (version.isDraft) {
                  <button mat-button type="button" (click)="editDraft.emit(version)">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button mat-flat-button type="button" (click)="publish.emit(version)">
                    <mat-icon>publish</mat-icon>
                    Publish
                  </button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [
    `
      .versions-table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 1px solid #dde2ea;
      }

      .actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .empty {
        color: #566071;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionListComponent {
  @Input() versions: LabVersionEntity[] = [];

  @Output() readonly view = new EventEmitter<LabVersionEntity>();
  @Output() readonly editDraft = new EventEmitter<LabVersionEntity>();
  @Output() readonly publish = new EventEmitter<LabVersionEntity>();

  trackVersion(version: LabVersionEntity): string {
    return entityId(version);
  }
}
