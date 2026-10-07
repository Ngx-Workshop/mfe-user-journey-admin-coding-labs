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
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { TagsChipsEditorComponent } from '../../components/tags-chips-editor.component';

import { CodingLabCreateViewModel } from './coding-lab-create.view-model';

@Component({
  selector: 'ngx-coding-lab-create-page',
  standalone: true,
  providers: [CodingLabCreateViewModel],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    TagsChipsEditorComponent,
    NgxParticleHeader,
    MatIconModule,
  ],
  template: `
    <ngx-particle-header class="labs-journey__particle-header">
      <h1>Create a coding lab</h1>
    </ngx-particle-header>
    <div class="labs-journey__particle-header-action-bar">
      <a matButton="filled" [routerLink]="['..']"
        ><mat-icon>arrow_back</mat-icon>All coding labs</a
      >
    </div>
    <section class="labs-journey__page">
      <div class="labs-journey__wrapper">
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
              <mat-select formControlName="difficulty">
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
              mat-button
              [routerLink]="['..']"
              [disabled]="vm.saving()"
              >Cancel</a
            >
            <button
              mat-flat-button
              type="vm.submit"
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
      .labs-journey__subtitle {
        color: var(--mat-sys-on-surface-variant);
        margin: 0;
      }
      .labs-journey__panel {
        padding: 24px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        min-width: 0;
      }
      .labs-journey__actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .labs-journey__form {
        display: grid;
        gap: 20px;
      }
      .labs-journey__row-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
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
        .labs-journey__panel {
          padding: 16px;
        }
        .labs-journey__row-2 {
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabCreatePage {
  readonly vm = inject(CodingLabCreateViewModel);
}
