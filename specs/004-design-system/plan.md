# Plan: Coding labs design system

Status: Complete
Spec: [spec.md](spec.md)
Updated: 2026-11-04

## Source and approach

Clean working tree; design system 21.0.10 and Webpack configured by user. Angular 21.1 standalone MVVM stays intact. Compose public NgxActionBar/NgxPanel/NgxButton/NgxInlineStatus/NgxCodeBlock; retain editable CodeMirror CVAs and typed Material fields. Theme overlays and textareas with public tokens. Reuse the established viewport measurement pattern as local helpers, with no sibling runtime dependency. Inline OnPush BEM presenters remain cohesive.

| Requirements | Files |
| --- | --- |
| FR-001 | Catalogue page and extracted compact catalogue rows |
| FR-002 | Create/overview/version pages, status/history and preview/result presenters |
| FR-003 | Editor page, authoring navigation and separate publish-check panel |
| FR-004 | Local panel/viewport helpers, responsive CSS; unchanged routes/API/store/models/config; narrow build-tool compatibility pins |

## Constitution / compatibility

One remote, existing default App and named Routes, singleton sharing, relative paths, service DTOs and publication ownership preserved. No execution in browser, no trust bypass. Only presentation-local panel/tab state added. Content forms remain mounted through editor navigation. Helpers clean up observers/listeners. No imported style-string arrays (known federation issue).

## Verification

Existing tests plus focused retained-form/tab and static result coverage; strict app/spec checks; check:architecture/check:layout; production output isolated from the user's development watcher. Hosted read/navigation checks and narrow viewport checks with native UI actions; record limitations accurately. No deployment or service changes.

## Implementation findings

The installed builder 21.2.29/webpack 5.112.0 failed license-webpack-plugin 4.0.2 (`trim` on an undefined federation module identifier). Applied the established admin-remote compatibility pins: direct @angular-devkit/build-angular 21.2.26 and webpack override 5.105.2. Regenerated the lock with Node 22/npm 10. License extraction remains enabled and a normal production build passes. `npm ci --dry-run --ignore-scripts --no-audit --no-fund` succeeds without replacing the running watcher's node_modules.

Authoring sections use native navigation buttons and mounted hidden containers to retain typed controls and CodeMirror instances. A few cohesive components exceed the advisory 230-line guideline (many already did); all retain inline templates/styles and pass architecture checks. Replaced invalid inherited `type="vm.submit"` with submit and `role="vm.status"` with status. Verification notice now points to Publish checks; no orchestration behavior changed. Mobile testing identified intrinsic CodeMirror/Material grid widths; constrained grid tracks and child widths locally rather than hiding overflow.
