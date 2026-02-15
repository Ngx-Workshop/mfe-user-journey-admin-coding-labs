import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { CodemirrorEditorComponent } from '../../../../shared/components/codemirror-editor/codemirror-editor.component';
import { CodingLabsApiClient } from '../../api/coding-labs-api-client.service';
import { LabVersionEntity } from '../../models/coding-labs.models';

@Component({
  selector: 'ngx-coding-lab-version-view-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    CodemirrorEditorComponent,
  ],
  template: `
    <section class="page">
      @if (loading()) {
      <div class="state">
        <mat-spinner diameter="30"></mat-spinner>
      </div>
      } @else if (error()) {
      <div class="state error">
        <p>{{ error() }}</p>
        <button mat-button type="button" (click)="load()">
          Retry
        </button>
      </div>
      } @else if (version()) {
      <h1>Version v{{ version()?.versionNumber ?? '?' }}</h1>

      <section>
        <h2>Prompt</h2>
        <pre class="markdown">{{
          version()?.promptMarkdown || '(empty)'
        }}</pre>
      </section>

      <section>
        <h2>Starter Code</h2>
        <ngx-codemirror-editor
          [value]="version()?.starterCode || ''"
          [language]="version()?.language || 'typescript'"
          [readOnly]="true"
        ></ngx-codemirror-editor>
      </section>

      <section>
        <h2>Tests</h2>
        <pre>{{ testsText() }}</pre>
      </section>

      <section>
        <h2>Runner Config</h2>
        <pre>{{ runnerText() }}</pre>
      </section>

      <section>
        <h2>Reference Solution</h2>
        <button
          mat-button
          type="button"
          (click)="showReference.set(!showReference())"
        >
          {{ showReference() ? 'Hide' : 'Show' }}
        </button>

        @if (showReference()) {
        <ngx-codemirror-editor
          [value]="version()?.referenceSolution?.code || ''"
          [language]="version()?.language || 'typescript'"
          [readOnly]="true"
        ></ngx-codemirror-editor>
        <pre class="markdown">{{
          version()?.referenceSolution?.notesMarkdown || '(no notes)'
        }}</pre>
        }
      </section>
      }
    </section>
  `,
  styles: [
    `
      .page {
        padding: 20px;
        display: grid;
        gap: 14px;
      }

      section {
        display: grid;
        gap: 8px;
      }

      pre {
        background: #f6f8fb;
        border-radius: 8px;
        padding: 12px;
        overflow: auto;
      }

      .markdown {
        white-space: pre-wrap;
      }

      .state {
        min-height: 140px;
        display: grid;
        place-items: center;
      }

      .state.error {
        color: #b3261e;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodingLabVersionViewPage {
  private readonly api = inject(CodingLabsApiClient);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showReference = signal(false);
  readonly version = signal<LabVersionEntity | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  load(): void {
    const labId = this.route.snapshot.paramMap.get('labId');
    const versionId = this.route.snapshot.paramMap.get('versionId');
    if (!labId || !versionId) return;

    this.loading.set(true);
    this.error.set(null);

    this.api
      .getVersion(labId, versionId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (version) => this.version.set(version),
        error: () => this.error.set('Failed to load version.'),
      });
  }

  testsText(): string {
    const version = this.version();
    return JSON.stringify(
      {
        sampleTests: version?.sampleTests ?? [],
        hiddenTests: version?.hiddenTests ?? [],
      },
      null,
      2
    );
  }

  runnerText(): string {
    return JSON.stringify(this.version()?.runner ?? {}, null, 2);
  }
}
