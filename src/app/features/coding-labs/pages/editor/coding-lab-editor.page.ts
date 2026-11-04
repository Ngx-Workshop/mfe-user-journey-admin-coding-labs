import { signal } from '@angular/core';
import { NgxActionBar, NgxInlineStatus } from '@tmdjr/ngx-workshop-design-system';
import { LabsPanelComponent } from '../../components/labs-panel.component';
import { LabsViewportDirective } from '../../components/labs-viewport.directive';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { EditorCodeComponent } from './editor-code.component';
import { EditorPreviewComponent } from './editor-preview.component';
import { EditorProblemComponent } from './editor-problem.component';
import { EditorTestsComponent } from './editor-tests.component';
import { VerificationResultsComponent } from './verification-results.component';

import { CodingLabEditorViewModel } from './coding-lab-editor.view-model';

@Component({
  host: { class: 'ngx-design-system ngx-labs-design' },
  selector: 'ngx-coding-lab-editor-page',
  standalone: true,
  providers: [CodingLabEditorViewModel],
  imports: [NgxActionBar, NgxInlineStatus, LabsPanelComponent, LabsViewportDirective,NgxButton,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    VerificationResultsComponent,
    EditorProblemComponent,
    EditorCodeComponent,
    EditorTestsComponent,
    EditorPreviewComponent,
  ],
  template: `
    <ngx-action-bar [heading]="vm.labTitle() || 'Challenge studio'">
      <ngx-inline-status ngxActionBarIndicators [label]="vm.published() ? 'Published · read only' : vm.dirty() ? 'Unsaved changes' : 'Draft · saved'" [tone]="vm.dirty() ? 'warning' : 'neutral'" />
      <a mat-button ngxButton surface="outline" [routerLink]="['..']" aria-label="Challenge overview"><mat-icon>arrow_back</mat-icon><span class="lab-editor__back-label">Overview</span></a>
      @if (vm.versionId() && !vm.loading()) {
        <div class="labs-journey__actions">
              <button
                mat-stroked-button ngxButton surface="outline"
                (click)="vm.saveDraft()"
                [disabled]="!!vm.busy() || vm.published()"
              >
                {{ vm.busy() === 'save' ? 'Saving…' : 'Save draft' }}
              </button>
              <button
                mat-stroked-button ngxButton surface="outline"
                (click)="vm.verifyReference()"
                [disabled]="!!vm.busy() || vm.published()"
              >
                {{
                  vm.busy() === 'verify'
                    ? 'Running tests…'
                    : 'Verify solution'
                }}
              </button>
              <button
                mat-flat-button ngxButton surface="outline"
                (click)="vm.publishDraft()"
                [disabled]="!!vm.busy() || vm.published()"
              >
                {{
                  vm.busy() === 'publish'
                    ? 'Verifying & publishing…'
                    : 'Publish'
                }}
              </button>
            </div>
      }
    </ngx-action-bar>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper lab-editor__editor-page" ngxLabsViewport>
        @if (vm.loading()) {
          <div class="labs-journey__state" role="status">
            <mat-spinner
              diameter="32"
              aria-label="Loading challenge"
            />
            <p>Loading your challenge…</p>
          </div>
        } @else if (!vm.versionId()) {
          <div class="labs-journey__state" role="alert">
            <p>{{ vm.error() }}</p>
            <button mat-button ngxButton surface="glass" (click)="vm.load()">Retry</button>
          </div>
        } @else {
          @if (vm.error()) {
            <p
              class="labs-journey__banner labs-journey__banner--error"
              role="alert"
            >
              {{ vm.error() }}
            </p>
          }
          @if (vm.notice()) {
            <p class="labs-journey__banner" role="status">
              {{ vm.notice() }}
            </p>
          }
          @if (vm.published()) {
            <p class="labs-journey__banner">
              This version is published and read only.
              <a mat-button ngxButton surface="glass" [routerLink]="['..']"
                >Return to overview to start the next version</a
              >
            </p>
          }
          <div class="lab-editor__switch" role="group" aria-label="Studio panels"><button mat-button [attr.aria-pressed]="pane() === 'editor'" (click)="pane.set('editor')">Editor</button><button mat-button [attr.aria-pressed]="pane() === 'checks'" (click)="pane.set('checks')">Publish checks</button></div>
          <div class="lab-editor__workspace">
            <div class="lab-editor__authoring" [class.lab-editor__hidden]="pane() !== 'editor'">
              <nav class="lab-editor__tabs" aria-label="Authoring sections">
                @for (label of sections; track $index) { <button mat-button type="button" [attr.aria-pressed]="section() === $index" (click)="section.set($index)">{{ label }}</button> }
              </nav>
              <ngx-labs-panel [heading]="sections[section()]" [eyebrow]="'CODING LABS / VERSION ' + vm.versionNumber()" background="grid" [resetKey]="section()">
            <form [formGroup]="vm.form">

                <div [hidden]="section() !== 0"
                  ><ngx-editor-problem [form]="vm.form"
                /></div>
                <div [hidden]="section() !== 1"
                  ><ngx-editor-code [form]="vm.form"
                /></div>
                <div [hidden]="section() !== 2"
                  ><ngx-editor-tests
                    [disabled]="!!vm.busy() || vm.published()"
                    [form]="vm.form"
                    (add)="vm.addTest($event)"
                    (remove)="
                      vm.removeTest($event.suite, $event.index)
                    "
                    (jsonErrors)="
                      vm.setJsonErrors(
                        $event.suite,
                        $event.index,
                        $event.errors
                      )
                    "
                /></div>
                <div [hidden]="section() !== 3"
                  ><ngx-editor-preview
                    [value]="vm.preview()"
                    [title]="vm.labTitle()"
                    [language]="vm.form.controls.language.value"
                /></div>

            </form>
              </ngx-labs-panel>
            </div>
            <ngx-labs-panel heading="Publish checks" eyebrow="CODING LABS / VERIFICATION" shape="beveled" tone="secondary" [class.lab-editor__hidden]="pane() !== 'checks'">
            <details [open]="!vm.verification()"><summary>Publish checklist</summary>
            <aside class="lab-editor__checklist">
              <p class="labs-journey__eyebrow">PUBLISH CHECKLIST</p>
              <h2>Make it teachable.</h2>
              <p>1. Describe the problem and constraints.</p>
              <p>2. Provide a useful starting point.</p>
              <p>3. Cover examples and edge cases.</p>
              <p>4. Verify your reference solution.</p>
              <hr />
              <p>
                Publishing saves your edits and runs every test again.
                Published versions stay unchanged; future edits start
                a new draft.
              </p>
              @if (vm.verification(); as run) {
                <div
                  class="lab-editor__run-summary"
                  [class.lab-editor__result--failed]="!run.passed"
                  role="status"
                >
                  <strong
                    >{{ run.passedTests }} /
                    {{ run.totalTests }}</strong
                  >
                  <p>tests passed · {{ run.durationMs }} ms</p>
                </div>
              }
            </aside></details>
            <ngx-verification-results [verification]="vm.verification()" />
            @if (!vm.verification()) { <p class="labs-journey__muted">Verify your solution to see per-test results here.</p> }
            </ngx-labs-panel>
          </div>
        }
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
    .lab-editor__editor-page { display: flex; flex-direction: column; gap: 8px; }
    .lab-editor__workspace { display: grid; grid-template-columns: minmax(0, 1fr) 320px; grid-template-rows: minmax(0, 1fr); gap: 1rem; flex: 1; min-height: 0; }
    .lab-editor__authoring { min-width: 0; min-height: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); }
    .lab-editor__tabs { display: flex; gap: 4px; flex-wrap: wrap; padding-bottom: 8px; }
    .lab-editor__tabs button { min-height: 36px; font-size: 0.75rem; }
    .lab-editor__tabs button[aria-pressed='true'] { color: var(--ngx-color-primary); background: var(--ngx-color-surface-high); }
    .lab-editor__checklist { font-size: 0.75rem; }
    .lab-editor__checklist h2 { font-size: 1rem; }
    .lab-editor__run-summary { color: var(--ngx-color-success); }
    .lab-editor__result--failed { color: var(--ngx-color-error); }
    .lab-editor__switch { display: none; }
    @media (max-width: 1100px) {
      .lab-editor__workspace { grid-template-columns: minmax(0, 1fr); }
      .lab-editor__switch { display: flex; }
      .lab-editor__switch button[aria-pressed='true'] { background: var(--ngx-color-surface-high); }
      .lab-editor__authoring, .lab-editor__workspace > ngx-labs-panel { grid-column: 1; grid-row: 1; }
      .lab-editor__hidden { display: none; }
    }
    @media (max-width: 720px) {
      .lab-editor__back-label { display: none; }
      ngx-action-bar { gap: 4px; }
      .labs-journey__actions { gap: 4px; }
      .labs-journey__actions button { font-size: 0.65rem; padding-inline: 6px; }
      .lab-editor__tabs { gap: 0; padding-bottom: 4px; }
      .lab-editor__tabs button { padding-inline: 6px; font-size: 0.65rem; flex: 1; }
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabEditorPage {
  readonly pane = signal<'editor' | 'checks'>('editor');
  readonly section = signal(0);
  readonly sections = ['Problem', 'Code', 'Test cases', 'Learner preview'];
  readonly vm = inject(CodingLabEditorViewModel);
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    this.vm.beforeUnload(event);
  }
  hasUnsavedChanges() {
    return this.vm.hasUnsavedChanges();
  }
}
