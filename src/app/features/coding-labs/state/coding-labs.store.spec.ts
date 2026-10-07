import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CODING_LABS_API_BASE_URL } from '../../../config/coding-labs.config';
import { CodingLabsStore, DraftEvent } from './coding-labs.store';

describe('Coding labs singleton store', () => {
  let store: CodingLabsStore;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CODING_LABS_API_BASE_URL,
          useValue: '/api/labs-test',
        },
      ],
    });
    store = TestBed.inject(CodingLabsStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  const url = '/api/labs-test/labs/lab/versions/draft';

  it('saves before publishing and publishes the returned hash', () => {
    const events: DraftEvent[] = [];
    store
      .runDraft('publish', 'lab', 'draft', {
        createdBy: 'actor',
        expectedContentHash: 'old',
      })
      .subscribe((event) => events.push(event));
    http.expectNone(url + '/publish');
    const save = http.expectOne(url);
    expect(save.request.body.expectedContentHash).toBe('old');
    save.flush({ contentHash: 'new' });
    expect(events.map((event) => event.kind)).toEqual(['saved']);
    const publish = http.expectOne(url + '/publish');
    expect(publish.request.body.expectedContentHash).toBe('new');
    expect(publish.request.withCredentials).toBeTrue();
    publish.flush({ contentHash: 'new', isDraft: false });
    expect(events.map((event) => event.kind)).toEqual([
      'saved',
      'published',
    ]);
  });

  it('does not verify after a failed save', () => {
    let failed = false;
    store
      .runDraft('verify', 'lab', 'draft', {
        createdBy: 'actor',
        expectedContentHash: 'old',
      })
      .subscribe({ error: () => (failed = true) });
    http
      .expectOne(url)
      .flush(
        { message: 'Conflict' },
        { status: 409, statusText: 'Conflict' }
      );
    http.expectNone(url + '/verify');
    expect(failed).toBeTrue();
  });

  it('emits the persisted hash even if subsequent verification fails', () => {
    const events: DraftEvent[] = [];
    let failed = false;
    store
      .runDraft('verify', 'lab', 'draft', {
        createdBy: 'actor',
        expectedContentHash: 'old',
      })
      .subscribe({
        next: (event) => events.push(event),
        error: () => (failed = true),
      });
    http.expectOne(url).flush({ contentHash: 'saved' });
    http
      .expectOne(url + '/verify')
      .flush({}, { status: 500, statusText: 'Failed' });
    expect(events[0]).toEqual(
      jasmine.objectContaining({
        kind: 'saved',
        version: { contentHash: 'saved' },
      })
    );
    expect(failed).toBeTrue();
  });

  it('clears failed resource state and allows a retry', () => {
    store.loadCatalog({}).subscribe({ error: () => {} });
    http
      .expectOne('/api/labs-test/labs')
      .flush({}, { status: 500, statusText: 'Failed' });
    expect(store.catalog.loading()).toBeFalse();
    expect(store.catalog.error()).toBeTruthy();
    store.loadCatalog({ q: 'retry' }).subscribe();
    expect(store.catalog.error()).toBeNull();
    expect(store.catalog.loading()).toBeTrue();
    http.expectOne('/api/labs-test/labs?q=retry').flush([]);
    expect(store.catalog.data()).toEqual([]);
    expect(store.catalog.loading()).toBeFalse();
  });
  it('reuses the current draft without creating another one', () => {
    store.openDraft('lab').subscribe();
    http
      .expectOne('/api/labs-test/labs/lab')
      .flush({ _id: 'lab', currentDraftVersionId: 'draft' });
    http
      .expectOne('/api/labs-test/labs/lab/versions')
      .flush([{ _id: 'draft', isDraft: true }]);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush({ _id: 'draft' });
    expect(store.editor.data()?.version._id).toBe('draft');
  });

  it('creates a fresh draft when the referenced version is published', () => {
    store.openDraft('lab').subscribe();
    http
      .expectOne('/api/labs-test/labs/lab')
      .flush({ _id: 'lab', currentDraftVersionId: 'old' });
    http
      .expectOne('/api/labs-test/labs/lab/versions')
      .flush([{ _id: 'old', isDraft: false }]);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.createdBy).toBeTruthy();
    request.flush({ _id: 'fresh', isDraft: true });
    expect(store.editor.data()?.version._id).toBe('fresh');
  });
});
