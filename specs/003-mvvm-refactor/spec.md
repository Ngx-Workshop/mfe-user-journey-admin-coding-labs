# Feature: MVVM code quality refactor
Status: Complete (locally verified)
Created: 2026-10-06
Updated: 2026-10-07

## Problem and scope
The five authoring pages mix HTTP orchestration, local form state, request state and rendering. Refactor this remote, including its shared editor and unused seed examples, without changing routes, federation exports or generated contracts.

## Requirements
- FR-001: A stateless HTTP client is accessed only by a singleton state layer; page view models coordinate UI intentions through that layer.
- FR-002: Orchestration pages compose focused views; form state remains scoped to the page lifetime.
- FR-003: Templates/styles are colocated in component TypeScript, with BEM classes and a guideline of approximately 230 lines per component.
- FR-004: Superseded loads cannot replace current content; failed loads remain retryable. Preserve JSON validation, hashes, save-before-verify/publish, read-only publication and unsaved guards.

## Acceptance
- AC-001: Catalog filter changes cancel earlier requests and recover after failure (FR-004).
- AC-002: Editor persistence uses the saved hash before verification/publication and preserves recoverable edits on failure (FR-001, FR-004).
- AC-003: Production/development builds and unit tests pass; source inspection confirms layer boundaries, inline views and BEM names (FR-001–003).

## Boundaries and assumptions
No dependency upgrade, server change or data migration. Existing route/federation/HTTP contracts remain compatible. Browser verification uses the already running local MFE when accessible; server mutation is covered by HTTP doubles.
