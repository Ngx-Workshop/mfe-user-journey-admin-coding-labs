import { NgxActionBar } from '@tmdjr/ngx-workshop-design-system';
import { LabsPanelComponent } from '../../components/labs-panel.component';
import { LabsViewportDirective } from '../../components/labs-viewport.directive';
import { signal } from '@angular/core';
import { LabsCatalogRowsComponent } from './labs-catalog-rows.component';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import { CodingLabsCatalogViewModel } from './coding-labs-catalog.view-model';

@Component({
  host: { class: 'ngx-design-system ngx-labs-design' },
  selector: 'ngx-coding-labs-catalog-page',
  standalone: true,
  providers: [CodingLabsCatalogViewModel],
  imports: [LabsCatalogRowsComponent, NgxActionBar, LabsPanelComponent, LabsViewportDirective,NgxButton,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  template: `
    <ngx-action-bar heading="Coding labs">
      <a mat-flat-button ngxButton surface="outline" shape="chevron" [routerLink]="['new']"><mat-icon>add</mat-icon>Create a New Lab</a>
    </ngx-action-bar>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper labs-catalog__workspace" ngxLabsViewport>
        <div class="labs-catalog__switch" role="group" aria-label="Catalogue panels">
          <button mat-button [attr.aria-pressed]="pane() === 'filters'" (click)="pane.set('filters')">Filters</button>
          <button mat-button [attr.aria-pressed]="pane() === 'labs'" (click)="pane.set('labs')">Coding labs</button>
        </div>
        <ngx-labs-panel heading="Filter console" eyebrow="CODING LABS / FILTER" shape="chamfered" [class.labs-catalog__hidden]="pane() !== 'filters'">
        <form
          class="labs-journey__filters"
          [formGroup]="vm.filtersForm"
          (submit)="$event.preventDefault()"
          aria-label="Filter coding labs"
        >
          <mat-form-field
            appearance="outline"
            subscriptSizing="dynamic"
            ><mat-label>Search by title</mat-label
            ><mat-icon matPrefix>search</mat-icon
            ><input
              matInput
              formControlName="q"
              placeholder="e.g. Sum an array"
          /></mat-form-field>
          <mat-form-field
            appearance="outline"
            subscriptSizing="dynamic"
            ><mat-label>Workshop ID</mat-label
            ><input matInput formControlName="workshopId"
          /></mat-form-field>
          <mat-form-field
            appearance="outline"
            subscriptSizing="dynamic"
            ><mat-label>Status</mat-label
            ><mat-select panelClass="ngx-design-system-overlay ngx-select-panel" formControlName="status"
              ><mat-option value="">All statuses</mat-option
              ><mat-option value="draft">Draft</mat-option
              ><mat-option value="published">Published</mat-option
              ><mat-option value="archived"
                >Archived</mat-option
              ></mat-select
            ></mat-form-field
          >
          <mat-form-field
            appearance="outline"
            subscriptSizing="dynamic"
            ><mat-label>Tag</mat-label
            ><input matInput formControlName="tag"
          /></mat-form-field>
          <button mat-button ngxButton surface="glass" type="button" (click)="vm.clearFilters()" [disabled]="!vm.hasFilters()">Clear filters</button>
        </form>
        </ngx-labs-panel>
        <ngx-labs-panel heading="Challenges" eyebrow="CODING LABS / CATALOGUE" background="grid" [class.labs-catalog__hidden]="pane() !== 'labs'">
          <button labsPanelHeader mat-icon-button aria-label="Refresh coding labs" (click)="vm.reload()" [disabled]="vm.loading()"><mat-icon>refresh</mat-icon></button>
        @if (vm.loading()) {
          <div class="labs-journey__state" role="status">
            <mat-spinner diameter="32" aria-label="Loading labs" />
            <p>Loading labs…</p>
          </div>
        } @else if (vm.error()) {
          <div
            class="labs-journey__state labs-journey__panel"
            role="alert"
          >
            <h2>We couldn’t load your labs</h2>
            <p class="labs-journey__muted">
              Try again in a moment. Your filters are still here.
            </p>
            <button mat-stroked-button ngxButton surface="outline" (click)="vm.reload()">
              Try again
            </button>
          </div>
        } @else if (!vm.labs().length) {
          <div class="labs-journey__state labs-journey__panel">
            <mat-icon>search_off</mat-icon>
            <h2>
              {{
                vm.hasFilters()
                  ? 'No matching labs'
                  : 'Your first challenge starts here'
              }}
            </h2>
            <p class="labs-journey__muted">
              {{
                vm.hasFilters()
                  ? 'Try a different title, workshop, status, or
    tag.'
                  : 'Create a lab, add examples and edge cases, then verify your solution.'
              }}
            </p>
            @if (vm.hasFilters()) {
              <button mat-stroked-button ngxButton surface="outline" (click)="vm.clearFilters()">
                Clear filters
              </button>
            } @else {
              <a mat-flat-button ngxButton surface="outline" [routerLink]="['new']">Create lab</a>
            }
          </div>
        } @else {
          <p class="labs-journey__muted" role="status">
            {{ vm.labs().length }}
            {{ vm.labs().length === 1 ? 'lab' : 'labs' }} shown
          </p>
          <ngx-labs-catalog-rows [labs]="vm.labs()" [archivingId]="vm.archivingId()" (archive)="vm.archive($event)" />
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
    .labs-catalog__workspace { grid-template-columns: 280px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
    .labs-journey__filters { display: grid; gap: 16px; }
    .labs-catalog__switch { display: none; }
    @media (max-width: 1000px) {
      .labs-catalog__workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 8px; }
      .labs-catalog__switch { display: flex; }
      .labs-catalog__switch button[aria-pressed='true'] { background: var(--ngx-color-surface-high); }
      ngx-labs-panel { grid-row: 2; grid-column: 1; }
      .labs-catalog__hidden { display: none; }
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabsCatalogPage {
  readonly pane = signal<'filters' | 'labs'>('labs');
  readonly vm = inject(CodingLabsCatalogViewModel);
}
