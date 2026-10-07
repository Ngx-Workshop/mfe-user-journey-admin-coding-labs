# Handoff: MVVM code quality refactor
Status: Complete (local refactor and verification)
Updated: 2026-10-07
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered
- Stateless HTTP adapter retained; only the root singleton CodingLabsStore consumes it. Store resource signals are read only to consumers. The store owns draft selection/creation and ordered save/verify/publish command streams, including the server-returned publication hash.
- Five page-scoped view models own forms, navigation, feedback and lifecycle-bound streams. Superseded reads are cancelled and failures leave the refresh stream usable. Forms never enter singleton state.
- Thin orchestration pages compose focused editor problem/code/tests/preview/result views. Comparator and JSON fields are input/output-only views. Original controls and JSON error propagation survive extraction. Learner preview snapshots contain no reference solution or hidden tests.
- Every component has inline templates and scoped Sass with BEM classes. All components are at or below 230 lines except the 233-line test-case CVA, retained together for parsing/error propagation. The editor page fell from 432 lines of logic plus external views to 200 total lines with its view model and focused children.
- Unreachable seed CRUD examples removed. No generated contracts, dependencies, routes, federation exports or sharing configuration changed.
- Added `npm run check:architecture` and updated durable architecture/development guidance.

## Verification evidence
| Check | Result | Scope |
| --- | --- | --- |
| `npm run check:architecture` | PASS | HTTP/store boundaries, inline views, BEM syntax; advisory notice for 233-line CVA |
| `npm test -- --watch=false --browsers=ChromeHeadless` | PASS: 28 tests | Existing tests plus cancellation, retry, draft reuse/creation, hash ordering, conflicts, JSON errors, duplicate operations, publication locking, preview sanitization and composed form controls |
| `npm run build` | PASS | Production compilation; no Angular build warnings |
| `npm run build -- --configuration development` | PASS | Final dist restored for existing local bundle server; no Angular build warnings |
| `git diff --check` | PASS | Whitespace consistency |
| Hosted shell browser smoke | PASS | Catalog, overview, existing v3 draft and four tabs, published v2 inspection, creation form, relative navigation |
| Desktop layout inspection | PASS | At 1710px viewport the editor wrapper is 1197px with flex centering/grid layout, matching its 70vw clamp |

Server mutation flows were verified using HTTP test doubles. Browser checks read existing local data without saving, archiving or publishing content. Production deployment is outside this refactor.

## Integration findings
Browser verification exposed issues invisible to standalone unit tests: an implicitly injected toSignal bridge used a separate federation injection context, and imported style-string array entries compiled to duplicated constants in this webpack pipeline. The final code uses shared Angular signals with explicit lifetime-bound form subscriptions and one inline style literal per component. The centered layout was verified after this correction.

The shell emits Material component-ID collision warnings while loading remotes. This refactor preserves the existing sharing configuration; resolving broader shell/remote sharing is separate work.

## Context maintenance and next action
Updated docs/architecture.md, docs/development.md, constitution version 1.1.0 and the feature index. No external repository changes or migrations are required. Review the working-tree diff and commit when ready.

## Follow-up: published contracts and source/test relocation — 2026-10-07

Migrated the model adapter to `@tmdjr/coding-labs-contracts` 0.0.6 and removed
`src/app/contracts/coding-labs` and its generation command. Preserved the user's
package/lockfile updates. Moved the feature into `src/app/coding-labs` and its
CodeMirror component into `src/app/coding-labs/codemirror-editor`.

Moved all eight specs into `testing/app`, mirroring application source paths.
Updated imports, the route module, TypeScript test/application configuration and
Karma discovery. Architecture checks now enforce the mirrored spec layout.
No route URLs, federation exposure paths or runtime behavior changed.

Verification: TypeScript test compilation passed; all 28 ChromeHeadless tests
were discovered and passed from the new tree. Production and development builds
passed. This structural follow-up did not repeat the prior browser smoke tests.
README and architecture/development guidance reflect the new paths and package.
