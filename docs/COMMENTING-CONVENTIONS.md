# ISEP Commenting Conventions

Guidelines for adding and maintaining comments so new developers can understand the codebase.

---

## 1. File / module level

- **Frontend (TypeScript/React):** Add a JSDoc block at the top of the file describing what the file does and how it fits in (e.g. “Server actions for meetings”, “Role-based dashboard page”).
- **Backend (Java):** Add a class-level Javadoc for controllers, services, and key domain entities: purpose, base path (for controllers), and any non-obvious behaviour (e.g. fallbacks, version 1 handling).

## 2. Functions and methods

- **Public API (backend):** Controllers and service methods that are part of the public or internal API should have a short Javadoc line describing the operation (e.g. “Paginated list; optional filters: bodyId, status, q”).
- **Frontend:** Document server actions and non-trivial helpers (e.g. “Parse API error response: prefer JSON message, else status text”).
- **Complex logic:** Add a brief inline comment before non-obvious blocks (e.g. “Version 1 with no row: use main document file”, “Fallback: first active user when JWT subject not in core.users”).

## 3. Sections and structure

- In long files (e.g. `lib/api.ts`), use section comments to group related types and functions (e.g. `// ========== Reference data ==========`, `// ========== Meetings ==========`).
- In backend classes, a single line like `// --- Injected dependencies ---` or `// --- Public API ---` can separate fields from methods.

## 4. What to avoid

- Do not comment the obvious (e.g. “get the user” for `getUser()`).
- Do not leave commented-out code in place; remove it or document why it must stay (e.g. “Kept for migration rollback”).
- Do not duplicate the SRS in comments; reference document/section (e.g. “SCR-COL”, “SCR-DOC”) where useful and keep the comment concise.

## 5. References

- **SRS / screens:** Use identifiers like SCR-MTG-01, SCR-COL, ACT-B06 when a comment relates to a requirement or screen.
- **Project rules:** Mention project-level rules where they affect behaviour (e.g. “Project rule: all dropdown options from DB via reference API”).

---

*See also: Technical Design Document in `docs/design/` (Parts 1–4).*
