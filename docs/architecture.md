# Architecture — admin coding labs

## Boundary

This remote owns administrator authoring. The shell owns navigation/authentication and loads ./Component (default App) and ./Routes (named Routes) from remoteEntry.js. Exposures, federation name and shared Angular compatibility remain intact. Routes work standalone at /coding-labs or mounted under /coding-labs-editor.

The backend owns persistence, validation, authorization, hidden tests, verification and publication. The browser never executes reference code or certifies a passing result.

## Source map

| Source | Purpose |
| --- | --- |
| src/app/features/coding-labs/pages/catalog | Search/filter/archive and relative navigation |
| pages/create | Workshop metadata creation, then navigate into editor |
| pages/editor | Typed reactive form, four authoring tabs, save/verify/publish, results and unsaved protection |
| pages/overview and version-view | Metadata/history, pinned embed reference and immutable content inspection |
| components/io-testcase-editor.component.ts | JSON input/output and comparator editing |
| shared/components/codemirror-editor | Accessible code editor/CVA |
| api/coding-labs-api-client.service.ts | Stateless credentialed HTTP adapter; consumed only by the store |
| state/coding-labs.store.ts | Singleton server resources, draft selection, save/verify/publish sequencing |
| pages/*/*.view-model.ts | Page-scoped UI state, typed forms, routing and lifetime-bound streams |
| pages/editor/editor-*.component.ts | Focused form views and learner-only preview snapshots |
| pages/editor/verification-results.component.ts | Input-only verification rendering |
| components/comparator-editor.component.ts and json-value-editor.component.ts | Input/output-only test field views |
| src/app/contracts/coding-labs | Generated local snapshot of service OpenAPI |
| src/environments | Development API versus production gateway |

## Authoring behavior

Opening a new lab asks the service to create/reuse its draft. Saves update that ID with expectedContentHash. The returned hash replaces the loaded one. Stale edits show the server's conflict message. Loading a publication for continued editing starts a new draft.

Problem statements use Markdown; previews bind Marked output through Angular's normal HTML sanitizer, without trust bypasses. CodeMirror editors hold starter/reference code. JSON editors preserve null and primitives, surface malformed input and block saving stale parsed values. Sample cases are learner-visible; hidden cases/reference stay in authoring views.

Verification first saves the form, then requests server execution of the stored reference. Publishing saves, sends the current hash, and requests server re-verification. Inputs are disabled during operations and after publication. Errors retain recoverable form content; route/window guards warn about unsaved edits. A publication is read-only; later work starts a new draft.

The function contract is one JSON argument, one finite JSON return value. Multiple conceptual parameters belong in an object. JavaScript/TypeScript only; imported packages and Angular component harnesses are out of scope.

## External contracts

service-coding-labs owns /labs, /versions, /embeds and /published-labs. Production gateway maps /api/coding-labs to that service. Local builds use http://localhost:3009. The shell must supply its existing authenticated session; the API enforces admin access. Local service mode deliberately uses a separate local database.

Document/learner repositories can use the overview's labId/pinnedVersionId reference and the backend's redacted published-content endpoint. This remote does not implement learner submissions, scoring or workshop document editing.

References: [Marked](https://marked.js.org/), [Angular sanitization](https://angular.dev/best-practices/security).

## MVVM and component boundaries

The dependency direction is page → page-scoped view model → root CodingLabsStore → CodingLabsApiClient → HTTP. Only the store imports the HTTP adapter. The adapter owns no resource signals, cache or UI state. The store exposes read-only data/loading/error signals and cold load/command streams. Resource mutations stay private to the store.

Each page provides its own view model. Form controls, unsaved state, navigation, confirmations and snackbars follow that page's lifetime. Replaceable reads use switchMap, handle errors inside the inner stream, and unsubscribe on destruction. This prevents stale route/search results and allows retry after failure. Commands are guarded against repeated clicks. Editor route refresh also cancels observation of any previous command.

The store selects/reuses or creates drafts and saves before verification/publication. Typed command events report the saved hash even if a later verification fails. Publication uses the save response's hash. Form views receive the original typed controls and emit intentions; they do not inject the store or HTTP client. Preview receives only prompt, starter code and sample tests, with explicit signal updates after server patches and form edits. All components use OnPush.

Templates and component-scoped Sass are inline in each component TypeScript file. Authored classes use BEM; responsive layout, theme tokens, focus indicators and the centered clamp wrapper are retained. Rules needed by a view are colocated with it. Avoid imported style-string arrays in this webpack pipeline: browser verification found the same generated constant substituted for distinct array entries. Explicit subscriptions to the shared Angular signal API avoid the shell/remote injection-context mismatch observed with an implicitly injected toSignal bridge. Federation sharing configuration remains unchanged.

Use `npm run check:architecture` to check the HTTP/store boundary, inline views, BEM syntax and the advisory 230-line guideline. The test-case CVA is 233 lines to keep JSON parsing/error propagation together; other components are below the guideline. Unreachable seed CRUD demonstrations were removed.
