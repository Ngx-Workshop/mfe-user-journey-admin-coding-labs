# Tasks
- [x] T001 Add singleton resource/command state layer and page view models (FR-001, AC-001/002).
- [x] T002 Split views, inline templates/styles and apply BEM (FR-002/003, AC-003).
- [x] T003 Add regression coverage and run unit tests/builds (FR-004, AC-001–003).
- [x] T004 Update architecture and verification handoff.

## Evidence
T001: store HTTP tests prove draft reuse/creation and save-before-publish hash ordering. Page streams cancel older reads and remain retryable.
T002: all five pages compose page-scoped view models; focused editor and comparator/JSON views have inline BEM styles. Source checks confirm no external component views or direct API dependencies.
T003: 28 ChromeHeadless tests pass, including extracted form wiring and learner preview sanitization. Production and development builds are checked in the handoff.

T004: context docs and handoff updated with local build/test/browser evidence and integration findings.
