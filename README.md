# Coding Labs admin creator

Angular 21 microfrontend for authoring Ngx-Workshop coding challenges: problem statements, starter/reference code, sample and hidden tests, verification results, immutable publication, catalog and version history.

Read [AGENTS.md](AGENTS.md), [architecture](docs/architecture.md), [development](docs/development.md), and the [feature spec](specs/001-challenge-authoring/spec.md).

## Local workflow

1. npm ci.
2. Start service-coding-labs on localhost:3009 using its local development instructions.
3. npm start for standalone development, or npm run dev:bundle to serve remoteEntry.js on port 4201 for the existing shell registration.
4. Open the [admin coding labs route](https://admin.ngx-workshop.io/coding-labs-editor/coding-labs) with the shell configured to load this local remote.
5. Create a lab, add a reference solution and cases, verify, then publish.

Development builds replace environment.ts with environment.development.ts, whose codingLabsApiBaseUrl is http://localhost:3009. Production builds retain /api/coding-labs. Do not deploy development bundles.

## Checks

- npm run build — production compilation.
- npm run build -- --configuration development — local remote bundle.
- npm test -- --watch=false --browsers=ChromeHeadless — behavior tests.
- npm run check:architecture — validate layer boundaries and source/test layout.

See the [handoff](specs/001-challenge-authoring/handoff.md) for tested flows and deployment boundaries.

## Source layout and contracts

Application code lives in `src/app/features/coding-labs`, including the feature's
`codemirror-editor` component. Unit specs live separately in `testing/app/features/coding-labs`,
mirroring the directory layout beneath `src/app`.

DTOs come from the pinned `@tmdjr/coding-labs-contracts` 0.0.6 package. Local
generated contract copies and regeneration scripts are no longer used.
