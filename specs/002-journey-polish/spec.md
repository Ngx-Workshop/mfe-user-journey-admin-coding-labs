# Code Labs journey polish

Audience: workshop authors using the hosted admin shell and local remote.

- FR-001: Catalog, creation, overview, editor and version inspection share the requested `flex: 0 1 clamp(480px, 70vw, 1400px)` content wrapper, with no page overflow on small screens.
- FR-002: Consistent headings, back navigation, spacing, theme colors, dates and primary actions explain where authors are and what to do next.
- FR-003: Search is debounced and stale requests cannot replace newer results; loading, empty and failure states offer useful feedback.
- FR-004: Creation explains required metadata and validation. Archived labs offer inspection only. Draft actions are unambiguous.
- FR-005: Version inspection renders the statement, separates sample/hidden tests, and keeps reference content collapsed. Editor help and verification feedback remain available on small screens.

Acceptance: inspect all five routes in the hosted shell; exercise search/empty reset, invalid creation, overview-to-editor/version navigation and version expansion. Check desktop and narrow layouts. Preserve API, federation and production configuration. Initial scope was local UI work; the user subsequently authorized production deployment through the existing main-branch workflow.
