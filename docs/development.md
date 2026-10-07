# Development

Angular 21.1, RxJS 7.8.2, Material, Module Federation and CodeMirror. Use npm ci and the existing Node toolchain. The shell and service are external owners; no sibling checkout is required to build or run unit tests.

## Configuration

Development file replacement sets codingLabsApiBaseUrl=http://localhost:3009; production uses /api/coding-labs. Keep the production environment free of local addresses. The local service must allow the browser origin and run its explicit local mode to test without production credentials against local Mongo.

npm start runs ng serve on 4201. npm run dev:bundle combines a development watch build and static server on 4201; do not start a second server if VS Code already runs it. Production builds overwrite the same dist folder, so rebuild with --configuration development before testing inside the hosted shell.

The existing federation identity/exposures and singleton versions are retained. Navigation uses relative routes so the shell mount prefix survives. The root App header is for standalone use; the host loads the Routes exposure.

## Quality checks

Run `npm run check:architecture`, `npm test -- --watch=false --browsers=ChromeHeadless`, and `npm run build`. Rebuild with `npm run build -- --configuration development` before using the existing local bundle server in the shell. Do not reload the shell while a production build temporarily occupies dist.

The architecture check rejects direct HTTP-client use outside the API layer, direct API-adapter dependencies outside the store, external component template/style files and malformed BEM names. Component length above 230 is advisory. Regression coverage includes cancellation/retry, draft reuse/creation, hash sequencing, JSON errors, recoverable edits, publication locking, preview sanitization and extracted form-view wiring.

## Tests and contracts

npm test -- --watch=false --browsers=ChromeHeadless uses installed Chrome. On macOS, CHROME_BIN may point to /Applications/Google Chrome.app/Contents/MacOS/Google Chrome.

Contracts come from the pinned `@tmdjr/coding-labs-contracts` 0.0.6 package.
Update that dependency to consume a new published contract version. The feature
model adapter imports its types directly; there are no local generated model
copies or `contracts:generate` command.

Specs live in `testing/app`, mirroring `src/app`. `tsconfig.spec.json` includes
the testing tree and declarations; imported application code is compiled with
the specs. The Karma builder resolves its include pattern relative to `src`, so
`angular.json` explicitly uses `../testing/**/*.spec.ts`. The application build
excludes testing sources. `npm run check:architecture` also rejects specs inside
`src/app` and checks that each mirrored spec has a corresponding source file.

Meaningful tests cover JSON round trips, malformed input, request credentials/hash and reference verification requests; see feature handoff for browser and service integration evidence. Production compilation alone is not end-to-end verification.

## Limitations

No learner judge, attempt tracking, alternate language runtime or Angular component-test harness. Legacy unit/custom cases cannot be published until converted. Metadata creation precedes draft creation; if opening fails, the saved catalog lab remains recoverable. Unused seed CRUD examples have been removed. Dependency audits report findings; no broad framework migration is included.

Production service deployment must provide auth and an isolated Docker runner; this task only verifies the local service through the hosted shell.
