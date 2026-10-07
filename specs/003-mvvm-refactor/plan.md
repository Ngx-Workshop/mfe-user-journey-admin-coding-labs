# Implementation plan: MVVM refactor
Status: Implemented and locally verified

1. Retain `api/coding-labs-api-client.service.ts` as a stateless HTTP adapter. Add `state/coding-labs.store.ts` to own server resource signals and multi-request draft/save workflows. Expose read-only resource state and cold command streams.
2. Extract page-scoped injectable view models beside each page. Own typed forms, routing, feedback and lifetime-bound subscriptions there. Use switchMap for replaceable reads, leaving form state out of the singleton.
3. Make page components thin orchestration adapters. Extract editor tabs into focused components and verification into an input-only view. Keep form controls shared by identity to preserve dirty/disabled/JSON behavior.
4. Inline component templates/styles. Inline the scoped rules needed by each view. Browser verification rejected imported style-string arrays because this webpack pipeline substituted duplicate generated constants. Rename app-owned CSS classes to BEM and remove unused seed examples.
5. Verify cancellation/recovery and persistence ordering with meaningful unit tests; compile both configurations and inspect the running UI. Update architecture, development notes and handoff.

## Constitution and compatibility
Standalone/OnPush, signals and RxJS remain the Angular model. No new state framework. Generated DTOs, routes, exports, credentials and sanitizer remain unchanged. No external repository work required.

## Risks
Component extraction can break reactive form parent directives and scoped styling: pass typed form groups explicitly and include journey styles in extracted views. Route reuse can leave stale draft/publication state: reset on each load and cancel superseded reads. Shared state exposes read-only signals to prevent page ownership leaking into HTTP access.

## Implementation findings
Browser checks exposed two issues beyond standalone unit compilation: implicitly injected toSignal used a different federation injection context, and imported style-string array entries compiled to duplicated component-specific constants. The final implementation uses explicit lifetime-bound form subscriptions updating shared Angular signals, and a single inline style literal per component. No shared dependency configuration changes were needed.

The 233-line test-case CVA is a deliberate small exception to the advisory guideline; comparator/JSON rendering lives in separate components while parsing/error propagation remains together.
