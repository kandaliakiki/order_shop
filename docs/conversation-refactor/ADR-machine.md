# ADR: Fate of `server/lib/conversation/`

## Status

Accepted (Step 7 cleanup)

## Decision

Keep `server/lib/conversation/` as an **experiment-only** implementation (Option B), and keep all active runtime paths on `ConversationManager`.

## Context

- The production webhook and testing API now share one live implementation path through `ConversationManager`.
- The refactor track introduces a repeatable regression harness in `server/scripts/conversation-regression.ps1`.
- The machine implementation is useful reference material, but is not yet the single source of truth for production behavior.

## Consequences

- Reduced confusion in active code paths: no delegate wrapper (`newConversationManager.service.ts`) remains.
- Future machine migration is still possible, but must be done behind explicit wiring and validated with the regression harness.
- Documentation reflects current reality: one active manager, one experimental machine folder.
