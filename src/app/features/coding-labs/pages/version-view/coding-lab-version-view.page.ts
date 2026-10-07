import { DatePipe, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { CodemirrorEditorComponent } from '../../../../shared/components/codemirror-editor/codemirror-editor.component';

import { CodingLabVersionViewViewModel } from './coding-lab-version-view.view-model';

@Component({
  selector: 'ngx-coding-lab-version-view-page',
  standalone: true,
  providers: [CodingLabVersionViewViewModel],
  imports: [
    DatePipe,
    JsonPipe,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    CodemirrorEditorComponent,
    NgxParticleHeader,
    MatIconModule,
  ],
  template: `
    <ngx-particle-header class="labs-journey__particle-header">
      @if (vm.version(); as current) {
        <h1>Version {{ current.versionNumber }}</h1>
      }
    </ngx-particle-header>
    <div class="labs-journey__particle-header-action-bar">
      <a matButton="filled" [routerLink]="['../..']"
        ><mat-icon>arrow_back</mat-icon>Challenge overview</a
      >
    </div>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper">
        @if (vm.version(); as current) {
          <p class="labs-journey__eyebrow">
            Version history ·
            {{
              current.isDraft
                ? 'Draft snapshot'
                : 'Published snapshot'
            }}
          </p>
          <p class="labs-journey__subtitle">
            Read-only inspection ·
            {{
              current.language === 'typescript'
                ? 'TypeScript'
                : 'JavaScript'
            }}
            @if (current.publishedAt) {
              · Published {{ current.publishedAt | date: 'medium' }}
            }
          </p>
        }
        @if (vm.loading()) {
          <div class="labs-journey__state" role="status">
            <mat-spinner diameter="32" aria-label="Loading version" />
            <p>Loading version…</p>
          </div>
        } @else if (vm.error()) {
          <div
            class="labs-journey__state labs-journey__panel"
            role="alert"
          >
            <h1>Version unavailable</h1>
            <p>{{ vm.error() }}</p>
            <button mat-stroked-button (click)="vm.load()">
              Try again
            </button>
          </div>
        } @else if (vm.version(); as current) {
          <section class="labs-journey__panel">
            <h2>Problem statement</h2>
            @if (current.promptMarkdown) {
              <div
                class="labs-journey__prose"
                [innerHTML]="vm.markdown(current.promptMarkdown)"
              ></div>
            } @else {
              <p class="labs-journey__muted">
                No problem statement yet.
              </p>
            }
          </section>
          <section class="labs-journey__panel">
            <h2>Starter code</h2>
            <p class="labs-journey__muted">
              Learner visible · Entry function:
              {{ current.runner.entryFnName || 'solve' }}
            </p>
            <ngx-codemirror-editor
              label="Starter code (read only)"
              [value]="current.starterCode || ''"
              [language]="current.language || 'typescript'"
              [readOnly]="true"
            />
          </section>
          @for (
            suite of [
              {
                name: 'Sample tests',
                tests: current.sampleTests || [],
                note: 'Learner visible',
              },
              {
                name: 'Hidden tests',
                tests: current.hiddenTests || [],
                note: 'Admin only',
              },
            ];
            track suite.name
          ) {
            <section class="labs-journey__form">
              <div>
                <h2>{{ suite.name }} · {{ suite.tests.length }}</h2>
                <p class="labs-journey__muted">{{ suite.note }}</p>
              </div>
              @for (test of suite.tests; track $index) {
                <details>
                  <summary>{{ test.name || 'Unnamed test' }}</summary>
                  @if (test.kind === 'io') {
                    <div class="labs-journey__value-grid">
                      <div>
                        <h3>Input</h3>
                        <pre>{{ test.input | json }}</pre>
                      </div>
                      <div>
                        <h3>Expected result</h3>
                        <pre>{{ test.expected | json }}</pre>
                      </div>
                    </div>
                    <p class="labs-journey__muted">
                      Comparison:
                      {{ vm.comparatorLabel(test.comparator?.kind) }}
                      @if (
                        test.comparator?.kind === 'numberTolerance'
                      ) {
                        · Tolerance
                        {{ test.comparator?.tolerance ?? 0 }}
                      }
                      @if (test.comparator?.normalizeWhitespace) {
                        · Normalize whitespace
                      }
                      @if (test.comparator?.ignoreCase) {
                        · Ignore case
                      }
                    </p>
                  } @else {
                    <p class="labs-journey__muted">
                      Legacy test definition
                    </p>
                    <pre>{{ test | json }}</pre>
                  }
                </details>
              } @empty {
                <p class="labs-journey__muted">
                  No tests in this vm.version.
                </p>
              }
            </section>
          }
          @if (current.hints?.length) {
            <section class="labs-journey__panel">
              <h2>Progressive hints</h2>
              <ol>
                @for (hint of current.hints; track $index) {
                  <li class="labs-journey__prose">{{ hint }}</li>
                }
              </ol>
            </section>
          }
          <section class="labs-journey__panel">
            <h2>Execution limits</h2>
            <dl
              class="labs-journey__meta-grid labs-journey__metadata"
            >
              <div>
                <dt>Timeout per test</dt>
                <dd>{{ current.runner.timeoutMs }} ms</dd>
              </div>
              <div>
                <dt>Memory per test</dt>
                <dd>{{ current.runner.memoryMb }} MB</dd>
              </div>
            </dl>
          </section>
          <section class="labs-journey__panel labs-journey__form">
            <div class="labs-journey__section-header">
              <div>
                <h2>Reference solution</h2>
                <p class="labs-journey__muted">
                  Admin only · Never included in learner content.
                </p>
              </div>
              <button
                mat-stroked-button
                (click)="vm.showReference.set(!vm.showReference())"
                [attr.aria-expanded]="vm.showReference()"
                aria-controls="reference-content"
              >
                {{
                  vm.showReference()
                    ? 'Hide solution'
                    : 'Show solution'
                }}
              </button>
            </div>
            @if (vm.showReference()) {
              <div id="reference-content">
                <ngx-codemirror-editor
                  label="Reference solution (read only)"
                  [value]="current.referenceSolution?.code || ''"
                  [language]="current.language || 'typescript'"
                  [readOnly]="true"
                />
                @if (current.referenceSolution?.notesMarkdown) {
                  <div
                    class="labs-journey__prose"
                    [innerHTML]="
                      vm.markdown(
                        current.referenceSolution?.notesMarkdown
                      )
                    "
                  ></div>
                }
              </div>
            }
          </section>
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
      h3 {
        font-size: 1rem;
        line-height: 1.5;
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
      .labs-journey__subtitle,
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
      .labs-journey__form {
        display: grid;
        gap: 20px;
      }
      .labs-journey__meta-grid,
      .labs-journey__value-grid {
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
      .labs-journey__prose {
        line-height: 1.8;
        overflow-wrap: anywhere;
      }
      details {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;
        padding: 16px;
        min-width: 0;
      }
      summary {
        cursor: pointer;
        font-weight: 600;
        line-height: 1.6;
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
        .labs-journey__meta-grid,
        .labs-journey__value-grid {
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
export class CodingLabVersionViewPage {
  readonly vm = inject(CodingLabVersionViewViewModel);
}
