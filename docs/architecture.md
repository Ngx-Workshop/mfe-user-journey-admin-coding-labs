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
| api/coding-labs-api-client.service.ts | All credentialed HTTP requests |
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
