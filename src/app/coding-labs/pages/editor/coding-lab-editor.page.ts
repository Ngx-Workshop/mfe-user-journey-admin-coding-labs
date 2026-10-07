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
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { EditorCodeComponent } from './editor-code.component';
import { EditorPreviewComponent } from './editor-preview.component';
import { EditorProblemComponent } from './editor-problem.component';
import { EditorTestsComponent } from './editor-tests.component';
import { VerificationResultsComponent } from './verification-results.component';

import { CodingLabEditorViewModel } from './coding-lab-editor.view-model';

@Component({
  selector: 'ngx-coding-lab-editor-page',
  standalone: true,
  providers: [CodingLabEditorViewModel],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    NgxParticleHeader,
    MatIconModule,
    VerificationResultsComponent,
    EditorProblemComponent,
    EditorCodeComponent,
    EditorTestsComponent,
    EditorPreviewComponent,
  ],
  template: `
    <ngx-particle-header class="labs-journey__particle-header">
      <h1>{{ vm.labTitle() }}</h1>
    </ngx-particle-header>
    <div class="labs-journey__particle-header-action-bar">
      <a matButton="filled" [routerLink]="['..']"
        ><mat-icon>arrow_back</mat-icon>Challenge overview</a
      >
    </div>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper lab-editor__editor-page">
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
            <button mat-button (click)="vm.load()">Retry</button>
          </div>
        } @else {
          <header
            class="lab-editor__editor-header labs-journey__page-header"
          >
            <div>
              <p class="labs-journey__eyebrow">
                CHALLENGE STUDIO · VERSION {{ vm.versionNumber() }}
              </p>
              <h1>{{ vm.labTitle() }}</h1>
              <p>
                {{
                  vm.published()
                    ? 'Published · read only'
                    : vm.dirty()
                      ? 'You have unsaved changes'
                      : 'Draft · saved'
                }}
              </p>
            </div>
            <div class="labs-journey__actions">
              <button
                mat-stroked-button
                (click)="vm.saveDraft()"
                [disabled]="!!vm.busy() || vm.published()"
              >
                {{ vm.busy() === 'save' ? 'Saving…' : 'Save draft' }}
              </button>
              <button
                mat-stroked-button
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
                mat-flat-button
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
          </header>
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
              <a mat-button [routerLink]="['..']"
                >Return to overview to start the next version</a
              >
            </p>
          }
          <div class="lab-editor__workspace">
            <form [formGroup]="vm.form">
              <mat-tab-group
                animationDuration="0ms"
                [preserveContent]="true"
              >
                <mat-tab label="1. Problem"
                  ><ngx-editor-problem [form]="vm.form"
                /></mat-tab>
                <mat-tab label="2. Code"
                  ><ngx-editor-code [form]="vm.form"
                /></mat-tab>
                <mat-tab label="3. Test cases"
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
                /></mat-tab>
                <mat-tab label="4. Learner preview"
                  ><ngx-editor-preview
                    [value]="vm.preview()"
                    [title]="vm.labTitle()"
                /></mat-tab>
              </mat-tab-group>
            </form>
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
            </aside>
          </div>
          <ngx-verification-results
            [verification]="vm.verification()"
          />
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
      .labs-journey__page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      .labs-journey__page-header > div {
        min-width: 0;
        flex: 1 1 280px;
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
      .labs-journey__eyebrow {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: var(--mat-sys-primary);
        text-transform: uppercase;
      }
      .labs-journey__actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
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
      .labs-journey__error {
        color: var(--mat-sys-error);
      }
      .labs-journey__banner {
        padding: 16px 20px;
        border-radius: 12px;
        margin: 0;
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }
      .labs-journey__banner.labs-journey__banner--error {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
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
        .labs-journey__page-header {
          align-items: flex-start;
        }
      }
      .labs-journey__wrapper > * {
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
      :host {
        display: block;
      }
      .lab-editor__editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        padding: 20px 0;
      }
      h2 {
        margin: 0;
        font-size: 1.4rem;
      }
      .labs-journey__eyebrow {
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        color: var(--mat-sys-primary);
        font-weight: 600;
      }
      .labs-journey__actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .lab-editor__workspace {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 240px;
        gap: 24px;
        align-items: start;
      }
      .lab-editor__workspace form {
        min-width: 0;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        overflow: hidden;
      }
      .lab-editor__checklist {
        border-radius: 16px;
        background: var(--mat-sys-surface-container-low);
        padding: 24px;
        line-height: 1.7;
      }
      .lab-editor__checklist h2 {
        line-height: 1.3;
      }
      .lab-editor__checklist p {
        font-size: 0.875rem;
      }
      .labs-journey__banner {
        border-radius: 10px;
        padding: 16px;
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }
      .labs-journey__error {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }
      .labs-journey__state {
        min-height: 200px;
        display: grid;
        place-content: center;
        gap: 16px;
      }
      .lab-editor__result--failed {
        color: var(--mat-sys-error);
      }
      .lab-editor__run-summary strong {
        font-size: 2rem;
      }
      @media (max-width: 1000px) {
        .lab-editor__workspace {
          grid-template-columns: 1fr;
        }
        .lab-editor__checklist {
          display: block;
        }
        .lab-editor__editor-header {
          align-items: start;
          flex-wrap: wrap;
        }
      }
      @media (max-width: 1250px) {
        .lab-editor__workspace {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .lab-editor__editor-header > .labs-journey__actions {
        flex: 0 1 auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabEditorPage {
  readonly vm = inject(CodingLabEditorViewModel);
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    this.vm.beforeUnload(event);
  }
  hasUnsavedChanges() {
    return this.vm.hasUnsavedChanges();
  }
}
