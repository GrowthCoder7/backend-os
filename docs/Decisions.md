## D-007 — Complete Entity Lifecycle as Sprint 2 Vertical Slice

**Date:** 2026-08-11
**Category:** Engineering / Implementation
**Status:** Accepted

### Context

Sprint 1 successfully established the first Architecture Operation
vertical slice using entity creation.

The Operation → Executor → Validation → Commit pipeline now needs
to prove that the same architecture supports the complete entity
lifecycle.

### Decision

Sprint 2 will implement entity.create, entity.update, and
entity.delete through the canonical Architecture Operation system.

Entity renaming is explicitly excluded from Sprint 2 because entity
identity semantics have not yet been formally designed.

### Consequences

The Store must route all three entity mutations through the
Operation Executor.

No direct graph mutation will be introduced for update or delete.

Relations, dependency conflict handling, history, undo/redo, and
other mutation domains remain deferred.