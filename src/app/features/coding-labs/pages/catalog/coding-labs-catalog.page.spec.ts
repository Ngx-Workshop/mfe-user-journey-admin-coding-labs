import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  Router,
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of } from 'rxjs';
import { CodingLabsCatalogPage } from './coding-labs-catalog.page';
import { CodingLabsApiClient } from '../../api/coding-labs-api-client.service';
import { LabEntity } from '../../models/coding-labs.models';

describe('Catalog request recovery', () => {
  it('cancels an older search so it cannot replace newer results', () => {
    const oldRequest = new Subject<LabEntity[]>();
    const latestRequest = new Subject<LabEntity[]>();
    const api = {
      listLabs: jasmine
        .createSpy()
        .and.returnValues(oldRequest, latestRequest),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CodingLabsApiClient, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})) },
        },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy() },
        },
        {
          provide: MatSnackBar,
          useValue: { open: jasmine.createSpy() },
        },
      ],
    });
    const page = TestBed.runInInjectionContext(
      () => new CodingLabsCatalogPage()
    );
    page.reload();
    oldRequest.error(new Error('late failure'));
    expect(page.error()).toBeNull();
    expect(page.loading()).toBeTrue();
    latestRequest.next([]);
    latestRequest.complete();
    expect(page.loading()).toBeFalse();
    expect(page.error()).toBeNull();
  });
});
