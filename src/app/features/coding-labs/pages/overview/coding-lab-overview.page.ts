import { NgxActionBar, NgxCodeBlock } from '@tmdjr/ngx-workshop-design-system';
import { LabsPanelComponent } from '../../components/labs-panel.component';
import { LabsViewportDirective } from '../../components/labs-viewport.directive';
import { signal } from '@angular/core';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
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
import { LabStatusChipComponent } from '../../components/lab-status-chip.component';
import { VersionListComponent } from '../../components/version-list.component';

import { CodingLabOverviewViewModel } from './coding-lab-overview.view-model';

@Component({
  host: { class: 'ngx-design-system ngx-labs-design' },
  selector: 'ngx-coding-lab-overview-page',
  standalone: true,
  providers: [CodingLabOverviewViewModel],
  imports: [NgxActionBar, NgxCodeBlock, LabsPanelComponent, LabsViewportDirective,NgxButton,
    DatePipe,
    TitleCasePipe,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LabStatusChipComponent,
    VersionListComponent,
    MatIconModule,
  ],
  template: `
    <ngx-action-bar [heading]="vm.lab()?.title || 'Coding lab overview'">
      <ngx-lab-status-chip ngxActionBarIndicators [status]="vm.status()" />
      <a mat-button ngxButton surface="outline" [routerLink]="['..']"><mat-icon>arrow_back</mat-icon>All coding labs</a>
    </ngx-action-bar>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper labs-overview__workspace" ngxLabsViewport>
        <div class="labs-overview__switch" role="group" aria-label="Overview panels"><button mat-button [attr.aria-pressed]="pane() === 'details'" (click)="pane.set('details')">Lab details</button><button mat-button [attr.aria-pressed]="pane() === 'versions'" (click)="pane.set('versions')">Versions</button></div>
        <ngx-labs-panel heading="Lab details" eyebrow="CODING LABS / OVERVIEW" shape="chamfered" [class.labs-overview__hidden]="pane() !== 'details'">
        @if (vm.loading()) {
          <div class="labs-journey__state" role="status">
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
            <button mat-stroked-button ngxButton surface="outline" (click)="vm.load()">
              Try again
            </button>
          </div>
        } @else if (vm.lab(); as current) {
          @if (vm.status() === 'archived') {
            <p class="labs-journey__banner" role="status">
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
                mat-flat-button ngxButton surface="outline"
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
          @if (current.latestPublishedVersionId) {
            <section class="labs-journey__panel">
              <div class="labs-journey__section-header">
                <h2>Use in a workshop</h2>
                <button
                  mat-stroked-button ngxButton surface="outline"
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
              <ngx-code-block [code]="vm.embedReference()" language="json" [wrap]="true" />
            </section>
          }
          @if (vm.status() !== 'archived') {
            <section class="labs-journey__section-header">
              <p class="labs-journey__muted">
                Finished with this lab? Archive it to stop further
                editing.
              </p>
              <button
                mat-button ngxButton surface="glass"
                (click)="vm.archiveLab()"
                [disabled]="vm.archiving()"
              >
                {{ vm.archiving() ? 'Archiving…' : 'Archive lab' }}
              </button>
            </section>
          }
        }
        </ngx-labs-panel>
        <ngx-labs-panel heading="Version history" eyebrow="CODING LABS / VERSIONS" background="grid" [class.labs-overview__hidden]="pane() !== 'versions'">
          @if (!vm.loading() && !vm.error()) {          <section>
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
          }
        </ngx-labs-panel>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; min-width: 0; background: var(--ngx-color-canvas); color: var(--ngx-color-text); }
    ngx-action-bar { --ngx-action-bar-top: var(--labs-toolbar-top, 96px); }
    .labs-journey__page { padding: 1rem; }
    .labs-journey__wrapper { display: grid; grid-template-columns: minmax(0, 1fr); min-height: 0; gap: 1rem; }
    .labs-journey__panel { min-width: 0; padding: 0; }
    .labs-journey__section-header, .labs-journey__actions { display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
    h1, h2, h3, p { overflow-wrap: anywhere; }
    h2 { font-family: var(--ngx-font-heading); font-size: 1rem; margin: 0 0 8px; }
    h3 { font-size: 0.85rem; }
    p { font-size: 0.85rem; line-height: 1.6; }
    .labs-journey__muted, .labs-journey__subtitle { color: var(--ngx-color-muted); }
    .labs-journey__eyebrow { color: var(--ngx-color-primary); font: var(--ngx-font-label); font-size: 0.65rem; }
    .labs-journey__state { display: grid; justify-items: center; text-align: center; gap: 8px; padding: 16px; }
    .labs-journey__banner { margin: 0; padding: 8px 12px; border-left: 2px solid var(--ngx-color-primary); background: var(--ngx-color-surface-high); }
    .labs-journey__banner--error { color: var(--ngx-color-error); border-color: currentColor; }
    .labs-journey__form { display: grid; gap: 12px; }
    .labs-journey__meta-grid, .labs-journey__value-grid, .labs-journey__row-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .labs-journey__metadata { margin: 12px 0; }
    .labs-journey__metadata dt { color: var(--ngx-color-muted); font-size: 0.7rem; }
    .labs-journey__metadata dd { margin: 4px 0 12px; overflow-wrap: anywhere; }
    mat-form-field { width: 100%; min-width: 0; }
    details { border: 1px solid var(--ngx-color-border); padding: 8px; margin-block: 8px; min-width: 0; }
    summary { cursor: pointer; font-size: 0.85rem; }
    .labs-journey__prose { overflow-wrap: anywhere; line-height: 1.65; }
    :where(a, button, summary):focus-visible { outline: 2px solid var(--ngx-color-primary); outline-offset: 2px; }
    @media (max-width: 720px) {
      ngx-action-bar { --ngx-action-bar-top: var(--labs-toolbar-top, 76px); }
      ngx-action-bar a, ngx-action-bar button { min-width: 0; padding-inline: 8px; font-size: 0.7rem; }
      .labs-journey__page { padding: 0.5rem; }
      .labs-journey__meta-grid, .labs-journey__value-grid, .labs-journey__row-2 { grid-template-columns: minmax(0, 1fr); }
    }
    .labs-overview__workspace { grid-template-columns: 340px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
    .labs-overview__switch { display: none; }
    @media (max-width: 1000px) {
      .labs-overview__workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 8px; }
      .labs-overview__switch { display: flex; }
      .labs-overview__switch button[aria-pressed='true'] { background: var(--ngx-color-surface-high); }
      ngx-labs-panel { grid-row: 2; grid-column: 1; }
      .labs-overview__hidden { display: none; }
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabOverviewPage {
  readonly pane = signal<'details' | 'versions'>('details');
  readonly vm = inject(CodingLabOverviewViewModel);
}
