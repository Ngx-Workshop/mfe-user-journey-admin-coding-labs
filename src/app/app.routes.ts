import { Routes as AppRoutes } from '@angular/router';
import { CODING_LABS_ROUTES } from './features/coding-labs/coding-labs.routes';

export const Routes: AppRoutes = [
  { path: '', pathMatch: 'full', redirectTo: 'coding-labs' },
  ...CODING_LABS_ROUTES,
];
