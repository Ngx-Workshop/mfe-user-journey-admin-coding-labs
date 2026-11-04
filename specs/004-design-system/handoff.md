# Handoff: Coding labs design system

Status: Complete
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)
Updated: 2026-11-04

## Delivered behavior

The catalogue's large hero/table is now a compact action bar, filter panel and linked challenge rows with separate archive controls. Creation uses a bounded metadata panel with existing validation. Overview separates metadata/embed reference from version history. Published snapshots use a scrollable panel, sanitized Markdown and design-system static code blocks; reference solution disclosure remains explicit.

The challenge studio keeps save/verify/publish controls in its action bar. Problem, code, test cases and learner preview share a bounded authoring panel; mounted form controls and editable CodeMirror instances survive section/panel switching. Publish checks and verification results occupy a separate scrollable panel; the checklist collapses when results exist. Returned JSON and learner preview use shared code blocks, retaining falsy/null values and normal escaping. Mobile switches panels and keeps all controls reachable without page horizontal overflow.

Local reusable panel/viewport helpers clean up observers. No runtime sibling imports, private design-system class dependencies, external templates/styles or imported style-string arrays. Semantic tokens theme existing fields, controls and overlays.

## Verification

| Check | Evidence / result |
| --- | --- |
| Regression suite | PASS: 31 ChromeHeadless tests (28 existing plus mounted-form/command-lock/code-result scenarios), `/tmp/coding-labs-design-tests.log` |
| App/spec TypeScript | PASS: strict app unused checks and spec compilation |
| Architecture / source layout | PASS: advisory size notes retained for cohesive existing views; no rule failures |
| Whitespace | PASS: git diff --check |
| Production | PASS: Node 22 normal production build with `/tmp/coding-labs-design-production`, no compiler/budget warnings; license output nonempty. Log `/tmp/coding-labs-design-build.log` |
| Lockfile | PASS: Node 22/npm 10 install and npm ci --dry-run --ignore-scripts --no-audit --no-fund. Build pins recorded in plan. |
| Hosted catalogue/overview | PASS: three existing local labs, no-match/clear recovery, navigation, version history and published v2 content, sample JSON and reference disclosure |
| Hosted editor | PASS: existing v3 draft, Problem/Code/Test cases/Learner preview, editable CodeMirror and redacted learner snapshot. No save, verify, publish or archive commands run against persisted data. |
| Mobile | PASS: 390×844 and 320×568. At 320px test-case body is 106px high, 1636px scrollable, equal client/scroll width 268px; End reaches scrollTop ~1530. Create body width/scroll width both 268px, content scrolls internally. Page remains 320×568. Desktop viewport restored. Shell logged view-transition cancellation when viewport size changed; final pages rendered normally. |
| Create validation | PASS: empty submit retains form and displays Workshop ID/title/slug validation; no lab created |

Browser checks used the hosted shell and user's running localhost:3009 service, reading existing lab/draft/version data. Existing tests cover create/save/verification/publication/hash sequencing and failures with doubles. Real isolated Docker execution/publication was not rerun for this presentation migration. No existing persisted lab or version was changed.

## Contracts and integration

Default App/named Routes, exposure identity, shared Angular compatibility, relative routing, API methods/DTOs, draft hashes, cancellation, publication locks, learner redaction and service ownership remain intact. API/store/forms/models/config/environment/webpack files unchanged. Runtime framework/dependency versions unchanged. Build-tool dependencies are pinned to avoid the reproduced license plugin failure; lockfile updated. The verification view-model notice changes only the location wording.

No backend, database migration, deployment or publishing task remains in this UI scope. Running development watcher/static server were preserved. Screenshots: `coding-labs-catalogue-design-system.jpg` and `coding-labs-studio-design-system.jpg` in the current Codex visualization directory.

## Context maintenance

Architecture/development/index updated with the new panel structure, build pins and verification boundaries. No outstanding migration implementation tasks.
