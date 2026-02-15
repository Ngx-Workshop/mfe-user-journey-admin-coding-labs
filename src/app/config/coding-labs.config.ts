import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export const CODING_LABS_API_BASE_URL =
  new InjectionToken<string>('CODING_LABS_API_BASE_URL', {
    factory: () => environment.codingLabsApiBaseUrl,
  });

export const CODING_LABS_ACTOR_ID = new InjectionToken<string>(
  'CODING_LABS_ACTOR_ID',
  {
    factory: () => environment.currentActorId,
  }
);
