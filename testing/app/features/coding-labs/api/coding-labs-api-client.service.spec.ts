import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CodingLabsApiClient } from '../../../../../src/app/features/coding-labs/api/coding-labs-api-client.service';
import { CODING_LABS_API_BASE_URL } from '../../../../../src/app/features/coding-labs/config/coding-labs.config';
describe('Coding labs API', () => {
  let api: CodingLabsApiClient;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CODING_LABS_API_BASE_URL,
          useValue: 'http://localhost:3009',
        },
      ],
    });
    api = TestBed.inject(CodingLabsApiClient);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('sends authentication credentials and the loaded content hash on save', () => {
    api
      .updateDraftVersion('lab', 'version', {
        createdBy: 'a',
        expectedContentHash: 'loaded',
      })
      .subscribe();
    const req = http.expectOne(
      'http://localhost:3009/labs/lab/versions/version'
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBeTrue();
    expect(req.request.body.expectedContentHash).toBe('loaded');
    req.flush({});
  });
  it('asks the server to verify a persisted version without a browser pass flag', () => {
    api.verifyVersion('lab', 'version').subscribe();
    const req = http.expectOne(
      'http://localhost:3009/labs/lab/versions/version/verify'
    );
    expect(req.request.body).toEqual({});
    req.flush({ passed: true, results: [] });
  });
});
