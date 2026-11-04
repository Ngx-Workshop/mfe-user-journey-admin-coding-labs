# Feature: Coding labs design system

Status: Complete
Feature ID: 004-design-system
Created: 2026-11-04
Updated: 2026-11-04
Request/source: Migrate the local coding labs authoring remote to the installed design system.

## Problem and scope

Large heroes and spaced cards put the catalogue and authoring content below the fold. Use compact shared panels throughout catalogue, metadata creation, overview/history, draft editor, verification and version inspection. Maintain existing MVVM, forms, sanitization and service-owned execution/publication.

## Requirements / acceptance

- FR-001 / AC-001: Catalogue has an action bar, filter rail, compact results and panel-owned scrolling. Retain relative navigation, filtering, loading/error/empty recovery and archive intentions.
- FR-002 / AC-002: Creation, overview/history and saved-version inspection use shared panels, statuses/buttons and static code blocks. Preserve create validation, version/edit/copy intentions and hidden/reference disclosure rules.
- FR-003 / AC-003: Editor actions stay visible above bounded authoring and publish-check/result panels. Problem/code/tests/learner preview retain the same typed controls through navigation. JSON errors, unsaved guards, save/verify/publish sequencing and publication locks continue to work.
- FR-004 / AC-004: Keyboard access, mobile panel switches, no page horizontal overflow, preserved App/Routes/federation/API contracts. No backend, runtime framework, or data migration. Pin build tooling if required for a normal production build.

## Verification and boundaries

Run existing ChromeHeadless suite, app/spec type checks, architecture/layout checks and isolated production build with licence output. Verify catalogue, read-only versions, draft authoring and mobile scrolling in the hosted shell with the running localhost:3009 service. Persisted save/verify/publish/archive are covered by test doubles unless an isolated fixture is needed; no existing published content is changed. The backend remains the authority for execution and publication.
