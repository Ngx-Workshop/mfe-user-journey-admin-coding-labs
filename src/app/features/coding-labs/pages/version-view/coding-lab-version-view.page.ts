import { NgxActionBar, NgxCodeBlock } from '@tmdjr/ngx-workshop-design-system';
import { LabsPanelComponent } from '../../components/labs-panel.component';
import { LabsViewportDirective } from '../../components/labs-viewport.directive';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
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

import { CodingLabVersionViewViewModel } from './coding-lab-version-view.view-model';

@Component({
  host: { class: 'ngx-design-system ngx-labs-design' },
  selector: 'ngx-coding-lab-version-view-page',
  standalone: true,
  providers: [CodingLabVersionViewViewModel],
  imports: [NgxActionBar, NgxCodeBlock, LabsPanelComponent, LabsViewportDirective,NgxButton,
    DatePipe,
    JsonPipe,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <ngx-action-bar [heading]="'Version ' + (vm.version()?.versionNumber || '')"><a mat-button ngxButton surface="outline" [routerLink]="['../..']"><mat-icon>arrow_back</mat-icon>Challenge overview</a></ngx-action-bar>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper" ngxLabsViewport><ngx-labs-panel heading="Version content" eyebrow="CODING LABS / SNAPSHOT" background="grid">
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
            <button mat-stroked-button ngxButton surface="outline" (click)="vm.load()">
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
            <ngx-code-block [code]="current.starterCode || ''" [language]="current.language || 'typescript'" [wrap]="true" />
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
                        <ngx-code-block [code]="(test.input | json) || \'null\'" language="json" [wrap]="true" />
                      </div>
                      <div>
                        <h3>Expected result</h3>
                        <ngx-code-block [code]="(test.expected | json) || \'null\'" language="json" [wrap]="true" />
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
                    <ngx-code-block [code]="(test | json) || \'null\'" language="json" [wrap]="true" />
                  }
                </details>
              } @empty {
                <p class="labs-journey__muted">
                  No tests in this version.
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
                mat-stroked-button ngxButton surface="outline"
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
                <ngx-code-block [code]="current.referenceSolution?.code || ''" [language]="current.language || 'typescript'" [wrap]="true" />
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
      </ngx-labs-panel></div>
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

  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabVersionViewPage {
  readonly vm = inject(CodingLabVersionViewViewModel);
}
