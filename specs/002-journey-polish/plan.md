# Plan

Use one component-scoped shared SCSS file for page framing, typography, panels, states and responsive tables. Keep existing Angular Material controls and shell ownership. Refine each page's template and focused interaction logic; no API changes. Use theme tokens rather than fixed light-theme colors. Verify with production compilation in a separate output directory, existing browser tests and the user's development watch server. Do not stop or replace that server.
