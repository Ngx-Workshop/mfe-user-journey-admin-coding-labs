import { Injectable, inject, signal } from '@angular/core';
import {
  Observable,
  concat,
  defer,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { CODING_LABS_ACTOR_ID } from '../../../config/coding-labs.config';
import { CodingLabsApiClient } from '../api/coding-labs-api-client.service';
import {
  CreateLabDto,
  LabEntity,
  LabVersionEntity,
  ListLabsQuery,
  UpdateDraftVersionDto,
  VerificationDto,
} from '../models/coding-labs.models';
import { apiError } from '../utils/coding-labs-form.utils';
import {
  entityId,
  newestFirst,
  selectDraftVersion,
} from '../utils/lab-entity.utils';

/** Server-owned resource state. Each load is cold and cancellation runs its cleanup. */
class LabResource<T> {
  private readonly value = signal<T | null>(null);
  private readonly pending = signal(false);
  private readonly failure = signal<string | null>(null);
  readonly data = this.value.asReadonly();
  readonly loading = this.pending.asReadonly();
  readonly error = this.failure.asReadonly();
  readonly state = {
    data: this.data,
    loading: this.loading,
    error: this.error,
  };

  update(value: T): void {
    this.value.set(value);
  }

  load(request: () => Observable<T>, message: string): Observable<T> {
    return defer(() => {
      this.value.set(null);
      this.pending.set(true);
      this.failure.set(null);
      return request().pipe(
        tap({
          next: (value) => this.value.set(value),
          error: (error) =>
            this.failure.set(apiError(error, message)),
        }),
        finalize(() => this.pending.set(false))
      );
    });
  }
}

@Injectable({ providedIn: 'root' })
export class CodingLabsStore {
  private readonly api = inject(CodingLabsApiClient);
  private readonly actorId = inject(CODING_LABS_ACTOR_ID);
  private readonly catalogResource = new LabResource<LabEntity[]>();
  readonly catalog = this.catalogResource.state;
  private readonly overviewResource = new LabResource<{
    lab: LabEntity;
    versions: LabVersionEntity[];
  }>();
  readonly overview = this.overviewResource.state;
  private readonly versionResource =
    new LabResource<LabVersionEntity>();
  readonly version = this.versionResource.state;
  private readonly editorResource = new LabResource<{
    lab: LabEntity;
    version: LabVersionEntity;
  }>();
  readonly editor = this.editorResource.state;

  loadCatalog(query: ListLabsQuery) {
    return this.catalogResource.load(
      () => this.api.listLabs(query),
      'Failed to load labs.'
    );
  }

  loadOverview(id: string) {
    return this.overviewResource.load(
      () =>
        forkJoin({
          lab: this.api.getLab(id),
          versions: this.api.listVersions(id),
        }).pipe(
          map(({ lab, versions }) => ({
            lab,
            versions: newestFirst(versions),
          }))
        ),
      'Failed to load lab details.'
    );
  }

  loadVersion(id: string, version: string) {
    return this.versionResource.load(
      () => this.api.getVersion(id, version),
      'Failed to load version.'
    );
  }

  openDraft(id: string) {
    return this.editorResource.load(
      () =>
        forkJoin({
          lab: this.api.getLab(id),
          versions: this.api.listVersions(id),
        }).pipe(
          switchMap(({ lab, versions }) => {
            const draft = selectDraftVersion(lab, versions);
            const request = draft
              ? this.api.getVersion(id, entityId(draft))
              : this.api.createDraftVersion(id, {
                  createdBy: this.actorId,
                });
            return request.pipe(map((version) => ({ lab, version })));
          })
        ),
      'Could not load this challenge.'
    );
  }

  createLab(dto: CreateLabDto) {
    return this.api.createLab(dto);
  }
  archiveLab(id: string) {
    return this.api.archiveLab(id);
  }

  /** Emits the persisted version before the follow-up result, including when it fails. */
  runDraft(
    action: DraftAction,
    id: string,
    versionId: string,
    payload: UpdateDraftVersionDto
  ): Observable<DraftEvent> {
    return this.api.updateDraftVersion(id, versionId, payload).pipe(
      tap((version) => {
        const current = this.editor.data();
        if (current && entityId(current.lab) === id)
          this.editorResource.update({ ...current, version });
      }),
      switchMap((version) => {
        const saved: DraftEvent = { kind: 'saved', version };
        const operation: Observable<DraftEvent> =
          action === 'verify'
            ? this.api
                .verifyVersion(id, versionId)
                .pipe(
                  map((verification) => ({
                    kind: 'verified',
                    verification,
                  }))
                )
            : action === 'publish'
              ? this.api
                  .publishVersion(id, versionId, {
                    publishedBy: this.actorId,
                    expectedContentHash: version.contentHash ?? '',
                  })
                  .pipe(
                    tap((published) => {
                      const current = this.editor.data();
                      if (current && entityId(current.lab) === id)
                        this.editorResource.update({
                          ...current,
                          version: published,
                        });
                    }),
                    map((published) => ({
                      kind: 'published',
                      version: published,
                    }))
                  )
              : of({ kind: 'completed' });
        return concat(of(saved), operation);
      })
    );
  }
}

export type DraftAction = 'save' | 'verify' | 'publish';
export type DraftEvent =
  | { kind: 'saved'; version: LabVersionEntity }
  | { kind: 'verified'; verification: VerificationDto }
  | { kind: 'published'; version: LabVersionEntity }
  | { kind: 'completed' };
