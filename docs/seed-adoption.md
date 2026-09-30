# Seed adoption record

Adapted from seed-mfe-remote on 2026-09-30. Workflow/templates are copied locally. No Spec Kit CLI, slash-command registration or sibling checkout is required.

The owned journey is coding challenge administration. Existing ./Component, ./Routes and remoteEntry.js interfaces remain. Authoring contracts are generated locally from the backend OpenAPI snapshot. Actual behavior tests and hosted local integration replace reliance on the seed smoke test. Context and decisions live in AGENTS.md, docs and specs/001-challenge-authoring.

Existing CI/deployment workflows were not run. A deployment owner must verify production gateway/admin authentication and backend execution infrastructure.
