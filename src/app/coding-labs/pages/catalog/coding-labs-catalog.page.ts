import { DatePipe, TitleCasePipe } from '@angular/common';
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
import { LabStatusChipComponent } from '../../components/lab-status-chip.component';

import { CodingLabsCatalogViewModel } from './coding-labs-catalog.view-model';

@Component({
  selector: 'ngx-coding-labs-catalog-page',
  standalone: true,
  providers: [CodingLabsCatalogViewModel],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    LabStatusChipComponent,
    DatePipe,
    TitleCasePipe,
    MatIconModule,
  ],
  template: `
    <header class="labs-catalog__header-background">
      <div class="labs-catalog__header-section">
        <div class="labs-catalog__header-headline">
          <h1>Coding-Labs-Editor</h1>
          <h2>
            Create challenges, test your solutions, and publish them
            for learners.
          </h2>
        </div>
        <div class="labs-catalog__header-start">
          <a matButton="elevated" [routerLink]="['new']"
            ><mat-icon>add</mat-icon>Create a New Lab</a
          >
        </div>
      </div>
    </header>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper">
        <form
          class="labs-journey__filters"
          [formGroup]="vm.filtersForm"
          (submit)="$event.preventDefault()"
          aria-label="Filter coding labs"
        >
          <!-- <div class="labs-journey__section-header">
    <h2>Find a lab</h2>
    <button mat-button type="button" (click)="vm.clearFilters()" [disabled]="!vm.hasFilters()" > Clear filters </button>
    </div> -->
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
            ><mat-select formControlName="status"
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
        </form>
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
            <button mat-stroked-button (click)="vm.reload()">
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
              <button mat-stroked-button (click)="vm.clearFilters()">
                Clear filters
              </button>
            } @else {
              <a mat-flat-button [routerLink]="['new']">Create lab</a>
            }
          </div>
        } @else {
          <p class="labs-journey__muted" role="status">
            {{ vm.labs().length }}
            {{ vm.labs().length === 1 ? 'lab' : 'labs' }} shown
          </p>
          <div
            class="labs-journey__table-wrap"
            tabindex="0"
            role="region"
            aria-label="Coding labs results"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Challenge</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                  <th scope="col">Difficulty</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (lab of vm.labs(); track vm.trackLab(lab)) {
                  <tr>
                    <td>
                      <a
                        class="labs-journey__title-link"
                        [routerLink]="[vm.trackLab(lab)]"
                        >{{ lab.title || 'Untitled lab' }}</a
                      >
                      <p class="labs-journey__muted">
                        {{ (lab.tags || []).join(' · ') }}
                      </p>
                    </td>
                    <td>
                      <ngx-lab-status-chip
                        [status]="vm.toStatus(lab)"
                      />
                    </td>
                    <td>
                      {{
                        lab.updatedAt
                          ? (lab.updatedAt | date: 'mediumDate')
                          : 'Not yet saved'
                      }}
                    </td>
                    <td>
                      {{ (lab.difficulty | titlecase) || 'Not set' }}
                    </td>
                    <td>
                      {{
                        lab.estimatedMinutes
                          ? lab.estimatedMinutes + ' min'
                          : 'Not set'
                      }}
                    </td>
                    <td class="labs-journey__table-actions">
                      <a
                        mat-button
                        [routerLink]="[vm.trackLab(lab)]"
                        [attr.aria-label]="'Open ' + lab.title"
                        >Open</a
                      >
                      @if (vm.toStatus(lab) !== 'archived') {
                        <button
                          mat-button
                          (click)="vm.archive(lab)"
                          [disabled]="!!vm.archivingId()"
                          [attr.aria-label]="'Archive ' + lab.title"
                        >
                          {{
                            vm.archivingId() === vm.trackLab(lab)
                              ? 'Archiving…'
                              : 'Archive'
                          }}
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
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
      .labs-journey__filters {
        display: grid;
        grid-template-columns: minmax(200px, 2fr) repeat(
            3,
            minmax(155px, 1fr)
          );
        gap: 12px;
        padding: 20px;
        border-radius: 16px;
        background: var(--mat-sys-surface-container-low);
        border: 1px solid var(--mat-sys-outline-variant);
      }
      @media (max-width: 1100px) {
        .labs-journey__filters {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 600px) {
        .labs-journey__filters {
          grid-template-columns: minmax(0, 1fr);
          padding: 16px;
        }
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
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
      }
      .labs-journey__wrapper > *,
      .labs-journey__section-header > div {
        min-width: 0;
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
      .labs-journey__title-link {
        color: var(--mat-sys-primary);
        text-decoration: none;
        font-weight: 600;
      }
      .labs-journey__title-link:hover {
        text-decoration: underline;
      }
      @media (max-width: 700px) {
        th,
        td {
          padding: 12px;
        }
      }
      .labs-catalog__header-background {
        background-color: var(--mat-sys-primary);
      }
      .labs-catalog__header-headline {
        color: var(--mat-sys-secondary-container);
      }
      .labs-catalog__header-start {
        color: var(--mat-sys-primary-container);
      }
      .labs-catalog__header-background {
        overflow: hidden;
        position: relative;
        height: 420px;
      }
      .labs-catalog__header-background::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="%23e3e3e3"><path d="M200-120q-51 0-72.5-45.5T138-250l222-270v-240h-40q-17 0-28.5-11.5T280-800q0-17 11.5-28.5T320-840h320q17 0 28.5 11.5T680-800q0 17-11.5 28.5T640-760h-40v240l222 270q32 39 10.5 84.5T760-120H200Zm80-120h400L544-400H416L280-240Zm-80 40h560L520-492v-268h-80v268L200-200Zm280-280Z"/></svg>');
        background-size: 400px;
        background-repeat: no-repeat;
        background-position: 75% 20px;
        opacity: 0.4;
      }
      .labs-catalog__header-section {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        height: 100%;
        text-align: center;
        position: relative;
      }
      .labs-catalog__header-headline {
        h1 {
          font-size: 7rem;
          font-weight: bold;
          line-height: 5.6rem;
          margin: 15px 5px;
        }
        h2 {
          font-size: 1.4rem;
          font-weight: 100;
          line-height: 28px;
          margin: 15px 0 25px 0;
        }
      }
      .labs-catalog__header-start {
        text-align: center;
        margin: 15px 0 0 0;
        .mat-mdc-raised-button {
          font-size: 15px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabsCatalogPage {
  readonly vm = inject(CodingLabsCatalogViewModel);
}
