# Development

Angular 21.1, RxJS 7.8.2, Material, Module Federation and CodeMirror. Use npm ci and the existing Node toolchain. The shell and service are external owners; no sibling checkout is required to build or run unit tests.

## Configuration

Development file replacement sets codingLabsApiBaseUrl=http://localhost:3009; production uses /api/coding-labs. Keep the production environment free of local addresses. The local service must allow the browser origin and run its explicit local mode to test without production credentials against local Mongo.

npm start runs ng serve on 4201. npm run dev:bundle combines a development watch build and static server on 4201; do not start a second server if VS Code already runs it. Use an isolated production output path while the development watcher runs; for example `npm run build -- --output-path /tmp/coding-labs-design-production`. This preserves the served development bundle.

The existing federation identity/exposures and singleton versions are retained. Navigation uses relative routes so the shell mount prefix survives. The root App header is for standalone use; the host loads the Routes exposure.

## Quality checks

Run `npm run check:architecture`, `npm test -- --watch=false --browsers=ChromeHeadless`, and `npm run build`. Keep production verification output separate from the served development dist folder.

The architecture check rejects direct HTTP-client use outside the API layer, direct API-adapter dependencies outside the store, external component template/style files and malformed BEM names. Component length above 230 is advisory. Regression coverage includes cancellation/retry, draft reuse/creation, hash sequencing, JSON errors, recoverable edits, publication locking, preview sanitization and extracted form-view wiring.

## Tests and contracts

npm test -- --watch=false --browsers=ChromeHeadless uses installed Chrome. On macOS, CHROME_BIN may point to /Applications/Google Chrome.app/Contents/MacOS/Google Chrome.

Contracts come from the pinned `@tmdjr/coding-labs-contracts` 0.0.8 package.
Update that dependency to consume a new published contract version. The feature
model adapter imports its types directly; there are no local generated model
copies or `contracts:generate` command.

Specs live in `testing/app/features/coding-labs`, mirroring `src/app`. `tsconfig.spec.json` includes
the testing tree and declarations; imported application code is compiled with
the specs. The Karma builder resolves its include pattern relative to `src`, so
`angular.json` explicitly uses `../testing/**/*.spec.ts`. The application build
excludes testing sources. `npm run check:architecture` also rejects specs inside
`src/app` and checks that each mirrored spec has a corresponding source file.

Meaningful tests cover JSON round trips, malformed input, request credentials/hash and reference verification requests; see feature handoff for browser and service integration evidence. Production compilation alone is not end-to-end verification.

## Limitations

No learner judge, attempt tracking, alternate language runtime or Angular component-test harness. Legacy unit/custom cases cannot be published until converted. Metadata creation precedes draft creation; if opening fails, the saved catalog lab remains recoverable. Unused seed CRUD examples have been removed. Dependency audits report findings; no broad framework migration is included.

Production service deployment must provide auth and an isolated Docker runner; this task only verifies the local service through the hosted shell.

## Source organization parity — 2026-10-07

See [source organization](source-organization.md). Run `npm run check:layout`,
the full ChromeHeadless suite, and a production build after relocating files.
Test include selectors now use `../testing/app/features/coding-labs/`.

Verified: 28 ChromeHeadless tests, application/spec TypeScript checks,
layout checks and production compilation pass. Builds used isolated
`/tmp/admin-layout-coding-labs-production` output, preserving watched bundles.
All existing TypeScript files were compared against HEAD: only relative path
strings changed. Hosted browser/service integration was not rerun for this
mechanical reorganization.

## Design-system verification — 2026-11-04

See [004 handoff](../specs/004-design-system/handoff.md). All 31 ChromeHeadless tests, strict app/spec type checks and architecture/layout checks pass. Hosted local-service checks cover catalogue recovery, create validation, overview/history, snapshot code blocks and all studio sections on desktop and 390/320px screens. Tests cover persisted commands with doubles; no existing data or publication was changed during the browser smoke check.

### Build compatibility

Pin @angular-devkit/build-angular to 21.2.26 and override webpack to 5.105.2. Builder 21.2.29 with webpack 5.112.0 reproduced an undefined `trim` failure in license-webpack-plugin 4.0.2 on federation modules. Normal production compilation passes with these pins and emits nonempty `3rdpartylicenses.txt`. Keep extraction enabled; re-evaluate the pins only after a normal build/license check proves compatibility. Regenerate locks with CI's Node 22/npm 10. The migration also passed an npm ci dry run without disturbing the running watcher.
