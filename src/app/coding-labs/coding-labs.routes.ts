import { Routes, CanDeactivateFn } from '@angular/router';
import { CodingLabsCatalogPage } from './pages/catalog/coding-labs-catalog.page';
import { CodingLabCreatePage } from './pages/create/coding-lab-create.page';
import { CodingLabEditorPage } from './pages/editor/coding-lab-editor.page';
import { CodingLabOverviewPage } from './pages/overview/coding-lab-overview.page';
import { CodingLabVersionViewPage } from './pages/version-view/coding-lab-version-view.page';

const leaveEditor: CanDeactivateFn<CodingLabEditorPage> = (page) =>
  !page.hasUnsavedChanges() ||
  confirm('Leave without saving your changes?');

export const CODING_LABS_ROUTES: Routes = [
  {
    path: 'coding-labs',
    children: [
      {
        path: '',
        component: CodingLabsCatalogPage,
      },
      {
        path: 'new',
        component: CodingLabCreatePage,
      },
      {
        path: ':labId/editor',
        component: CodingLabEditorPage,
        canDeactivate: [leaveEditor],
      },
      {
        path: ':labId/versions/:versionId',
        component: CodingLabVersionViewPage,
      },
      {
        path: ':labId',
        component: CodingLabOverviewPage,
      },
    ],
  },
];
