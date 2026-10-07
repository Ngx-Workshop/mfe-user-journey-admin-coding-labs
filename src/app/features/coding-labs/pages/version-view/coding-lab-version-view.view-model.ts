import {
  DestroyRef,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { marked } from 'marked';
import { EMPTY, Subject, catchError, switchMap } from 'rxjs';
import { CodingLabsStore } from '../../state/coding-labs.store';

@Injectable()
export class CodingLabVersionViewViewModel {
  private readonly store = inject(CodingLabsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.store.version.loading;
  readonly error = this.store.version.error;
  readonly showReference = signal(false);
  readonly version = this.store.version.data;

  private readonly refresh = new Subject<void>();

  constructor() {
    this.refresh
      .pipe(
        switchMap(() =>
          this.store
            .loadVersion(
              this.route.snapshot.paramMap.get('labId') ?? '',
              this.route.snapshot.paramMap.get('versionId') ?? ''
            )
            .pipe(catchError(() => EMPTY))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  load(): void {
    this.showReference.set(false);
    this.refresh.next();
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
