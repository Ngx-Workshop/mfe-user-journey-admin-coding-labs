import { NgxActionBar } from '@tmdjr/ngx-workshop-design-system';
import { LabsPanelComponent } from '../../components/labs-panel.component';
import { LabsViewportDirective } from '../../components/labs-viewport.directive';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { TagsChipsEditorComponent } from '../../components/tags-chips-editor.component';

import { CodingLabCreateViewModel } from './coding-lab-create.view-model';

@Component({
  host: { class: 'ngx-design-system ngx-labs-design' },
  selector: 'ngx-coding-lab-create-page',
  standalone: true,
  providers: [CodingLabCreateViewModel],
  imports: [NgxActionBar, LabsPanelComponent, LabsViewportDirective,NgxButton,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    TagsChipsEditorComponent,
    MatIconModule,
  ],
  template: `
    <ngx-action-bar heading="Create a coding lab"><a mat-button ngxButton surface="outline" [routerLink]="['..']"><mat-icon>arrow_back</mat-icon>All coding labs</a></ngx-action-bar>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper" ngxLabsViewport><ngx-labs-panel heading="Lab details" eyebrow="CODING LABS / NEW CHALLENGE">
        <header class="labs-journey__page-header">
          <div>
            <p class="labs-journey__eyebrow">
              New challenge · Step 1 of 2
            </p>
            <!-- <h1>Create a coding lab</h1> -->
            <p class="labs-journey__subtitle">
              Start with the details. Next, you’ll write the problem,
              code, and test cases.
            </p>
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
        <form
          class="labs-journey__form labs-journey__panel"
          [formGroup]="vm.form"
          (ngSubmit)="vm.submit()"
        >
          <mat-form-field appearance="outline">
            <mat-label>Workshop ID</mat-label>
            <input matInput formControlName="workshopId" required />
            <mat-hint
              >The workshop this challenge belongs to.</mat-hint
            >
            @if (
              vm.form.controls.workshopId.invalid &&
              vm.form.controls.workshopId.touched
            ) {
              <mat-error>Workshop ID is required</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input
              matInput
              formControlName="title"
              required
              maxlength="200"
            />
            @if (
              vm.form.controls.title.invalid &&
              vm.form.controls.title.touched
            ) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Slug</mat-label>
            <input
              matInput
              formControlName="slug"
              (input)="vm.onSlugInput()"
            />
            <mat-hint
              >Generated from the title; you can customize
              it.</mat-hint
            >
            @if (
              vm.form.controls.slug.invalid &&
              vm.form.controls.slug.touched
            ) {
              <mat-error
                >Use lowercase letters, numbers, and single
                hyphens.</mat-error
              >
            }
          </mat-form-field>
          <ngx-tags-chips-editor
            formControlName="tags"
          ></ngx-tags-chips-editor>
          <div class="labs-journey__row-2">
            <mat-form-field appearance="outline">
              <mat-label>Difficulty</mat-label>
              <mat-select panelClass="ngx-design-system-overlay ngx-select-panel" formControlName="difficulty">
                <mat-option value="intro">Introductory</mat-option>
                <mat-option value="easy">Easy</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="hard">Hard</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Estimated minutes</mat-label>
              <input
                matInput
                type="number"
                min="1"
                max="600"
                formControlName="estimatedMinutes"
              />
              <mat-hint>Optional · 1–600 minutes.</mat-hint>
              <mat-error
                >Enter a duration between 1 and 600
                minutes.</mat-error
              >
            </mat-form-field>
          </div>
          <div class="labs-journey__actions">
            <a
              mat-button ngxButton surface="glass"
              [routerLink]="['..']"
              [disabled]="vm.saving()"
              >Cancel</a
            >
            <button
              mat-flat-button ngxButton surface="outline"
              type="submit"
              [disabled]="vm.saving()"
            >
              {{
                vm.saving()
                  ? 'Creating lab…'
                  : 'Create and open editor'
              }}
            </button>
          </div>
        </form>
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
    .labs-journey__form { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
    .labs-journey__form > * { min-width: 0; }
    @media (max-width: 600px) { .labs-journey__actions button { white-space: normal; min-width: 0; padding-inline: 8px; font-size: 0.7rem; } }
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
export class CodingLabCreatePage {
  readonly vm = inject(CodingLabCreateViewModel);
}
