import { DatePipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { LabStatusChipComponent } from '../../components/lab-status-chip.component';
import { VersionListComponent } from '../../components/version-list.component';

import { CodingLabOverviewViewModel } from './coding-lab-overview.view-model';

@Component({
  selector: 'ngx-coding-lab-overview-page',
  standalone: true,
  providers: [CodingLabOverviewViewModel],
  imports: [
    DatePipe,
    TitleCasePipe,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LabStatusChipComponent,
    VersionListComponent,
    NgxParticleHeader,
    MatIconModule,
  ],
  template: `
    <ngx-particle-header class="labs-journey__particle-header">
      @if (vm.lab(); as current) {
        <h1>{{ current.title || 'Untitled lab' }}</h1>
        <ngx-lab-status-chip [status]="vm.status()" />
      }
    </ngx-particle-header>
    <div class="labs-journey__particle-header-action-bar">
      <a matButton="filled" [routerLink]="['..']"
        ><mat-icon>arrow_back</mat-icon>All coding labs</a
      >
    </div>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper">
        @if (vm.loading()) {
          <div class="labs-journey__state" role="vm.status">
            <mat-spinner diameter="32" aria-label="Loading lab" />
            <p>Loading lab details…</p>
          </div>
        } @else if (vm.error()) {
          <div
            class="labs-journey__state labs-journey__panel"
            role="alert"
          >
            <h1>Lab details unavailable</h1>
            <p>{{ vm.error() }}</p>
            <button mat-stroked-button (click)="vm.load()">
              Try again
            </button>
          </div>
        } @else if (vm.lab(); as current) {
          @if (vm.status() === 'archived') {
            <p class="labs-journey__banner" role="vm.status">
              This lab is archived. You can review its versions, but
              editing and publishing are unavailable.
            </p>
          } @else {
            <section
              class="labs-journey__panel labs-journey__panel--soft labs-journey__section-header"
            >
              <div>
                <h2>
                  {{
                    vm.draftVersion()
                      ? 'Your draft is ready to continue'
                      : current.latestPublishedVersionId
                        ? 'Ready for the next
    iteration?'
                        : 'Bring your challenge to life'
                  }}
                </h2>
                <p class="labs-journey__muted">
                  {{
                    vm.draftVersion()
                      ? 'Save, verify, and publish from the
    challenge editor.'
                      : current.latestPublishedVersionId
                        ? 'Start a new draft while your published version stays
    unchanged.'
                        : 'Add a problem, starter code, and tests in the editor.'
                  }}
                </p>
              </div>
              <button
                mat-flat-button
                (click)="vm.openEditor()"
                [disabled]="vm.archiving()"
              >
                {{
                  vm.draftVersion()
                    ? 'Continue editing'
                    : current.latestPublishedVersionId
                      ? 'Start next version'
                      : 'Open editor'
                }}
              </button>
            </section>
          }
          <section class="labs-journey__panel">
            <h2>Lab details</h2>
            <dl
              class="labs-journey__meta-grid labs-journey__metadata"
            >
              <div>
                <dt>Workshop</dt>
                <dd>{{ current.workshopId || 'Not set' }}</dd>
              </div>
              <div>
                <dt>Slug</dt>
                <dd>{{ current.slug || 'Not set' }}</dd>
              </div>
              <div>
                <dt>Difficulty</dt>
                <dd>
                  {{ (current.difficulty | titlecase) || 'Not set' }}
                </dd>
              </div>
              <div>
                <dt>Estimated duration</dt>
                <dd>
                  {{
                    current.estimatedMinutes
                      ? current.estimatedMinutes + ' minutes'
                      : 'Not set'
                  }}
                </dd>
              </div>
              <div>
                <dt>Tags</dt>
                <dd>
                  {{ (current.tags || []).join(' · ') || 'No tags' }}
                </dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>
                  {{
                    current.updatedAt
                      ? (current.updatedAt | date: 'medium')
                      : 'Not yet saved'
                  }}
                </dd>
              </div>
            </dl>
          </section>
          <section>
            <h2>Version history</h2>
            <p class="labs-journey__muted">
              Published versions are fixed snapshots. Changes belong
              in a draft.
            </p>
            <ngx-version-list
              [versions]="vm.versions()"
              [readOnly]="
                vm.status() === 'archived' || vm.archiving()
              "
              (view)="vm.viewVersion($event)"
              (editDraft)="vm.editDraft($event)"
            />
          </section>
          @if (current.latestPublishedVersionId) {
            <section class="labs-journey__panel">
              <div class="labs-journey__section-header">
                <h2>Use in a workshop</h2>
                <button
                  mat-stroked-button
                  (click)="vm.copyReference()"
                >
                  Copy reference
                </button>
              </div>
              <p class="labs-journey__muted">
                This reference pins the challenge to its latest
                published version, so future drafts won’t change your
                lesson.
              </p>
              <pre>{{ vm.embedReference() }}</pre>
            </section>
          }
          @if (vm.status() !== 'archived') {
            <section class="labs-journey__section-header">
              <p class="labs-journey__muted">
                Finished with this lab? Archive it to stop further
                editing.
              </p>
              <button
                mat-button
                (click)="vm.archiveLab()"
                [disabled]="vm.archiving()"
              >
                {{ vm.archiving() ? 'Archiving…' : 'Archive lab' }}
              </button>
            </section>
          }
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        color: var(--mat-sys-on-surface);
      }
      .labs-journey__page {
        display: flex;
        justify-content: center;
        padding: 0 16px;
      }
      .labs-journey__wrapper {
        flex: 0 1 clamp(480px, 70vw, 1400px);
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        padding: 28px 0 64px;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 24px;
        align-content: start;
      }
      .labs-journey__section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      h1 {
        margin: 6px 0 12px;
        font-size: clamp(1.65rem, 2.5vw, 2.2rem);
        line-height: 1.25;
        overflow-wrap: anywhere;
      }
      h2 {
        margin: 0 0 12px;
        font-size: 1.3rem;
        line-height: 1.4;
      }
      p {
        line-height: 1.6;
      }
      .labs-journey__muted {
        color: var(--mat-sys-on-surface-variant);
        margin: 0;
      }
      .labs-journey__panel {
        padding: 24px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        min-width: 0;
      }
      .labs-journey__panel--soft {
        background: var(--mat-sys-surface-container-low);
      }
      .labs-journey__meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
      }
      .labs-journey__state {
        min-height: 180px;
        display: grid;
        place-content: center;
        justify-items: center;
        text-align: center;
        gap: 12px;
        padding: 24px;
      }
      .labs-journey__state h2,
      .labs-journey__state p {
        margin: 0;
      }
      .labs-journey__banner {
        padding: 16px 20px;
        border-radius: 12px;
        margin: 0;
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }
      pre {
        box-sizing: border-box;
        max-width: 100%;
        overflow: auto;
        padding: 16px;
        border-radius: 10px;
        background: var(--mat-sys-surface-container-low);
        font-size: 0.875rem;
        line-height: 1.6;
      }
      .labs-journey__metadata {
        margin: 0;
      }
      .labs-journey__metadata dt {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.8rem;
        margin-bottom: 6px;
      }
      .labs-journey__metadata dd {
        margin: 0;
        overflow-wrap: anywhere;
      }
      :where(a, button, summary, textarea):focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 4px;
      }
      @media (max-width: 700px) {
        .labs-journey__wrapper {
          padding-top: 20px;
          gap: 20px;
        }
        .labs-journey__panel {
          padding: 16px;
        }
        .labs-journey__meta-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
        }
      }
      .labs-journey__wrapper > *,
      .labs-journey__section-header > div {
        min-width: 0;
      }
      .labs-journey__particle-header h1 {
        font-size: 1.85rem;
        font-weight: 100;
        margin: 1.7rem 1rem;
      }
      .labs-journey__particle-header-action-bar {
        position: sticky;
        top: 56px;
        height: 56px;
        z-index: 5;
        display: flex;
        flex-direction: row;
        width: 100%;
        background: var(--mat-sys-primary);
        align-items: center;
        a,
        button {
          color: var(--mat-sys-on-primary);
          background: var(--mat-sys-primary);
          margin: 0 12px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabOverviewPage {
  readonly vm = inject(CodingLabOverviewViewModel);
}
