import { DatePipe, JsonPipe } from '@angular/common';
import { marked } from 'marked';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CodemirrorEditorComponent } from '../../../../shared/components/codemirror-editor/codemirror-editor.component';
import { CodingLabsApiClient } from '../../api/coding-labs-api-client.service';
import { LabVersionEntity } from '../../models/coding-labs.models';

@Component({
  selector: 'ngx-coding-lab-version-view-page',
  standalone: true,
  imports: [
    DatePipe,
    JsonPipe,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    CodemirrorEditorComponent,
  ],
  templateUrl: './coding-lab-version-view.page.html',
  styleUrls: ['../journey.scss'],
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

    this.showReference.set(false);
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

  comparatorLabel(kind: string | undefined): string {
    const labels: Record<string, string> = {
      deepEqual: 'Deep equality',
      strictEqual: 'Exact value',
      stringNormalized: 'Normalized text',
      numberTolerance: 'Number within tolerance',
    };
    return labels[kind || 'deepEqual'] || kind || 'Deep equality';
  }

  markdown(value: string | undefined): string {
    return marked.parse(value || '', { async: false });
  }
}
