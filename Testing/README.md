# ISEP Testing

All testing-related docs and test cases live here. **Load only the files relevant to what you're building** to keep context lean.

---

## Folder structure

```
Testing/
├── README.md                    ← You are here (context-loading guide)
├── RUN-TESTING.md               ← What you need to do to run tests; results layout
├── ISEP-TESTING-CONTEXT.md      ← Architecture, 7 layers, invariants, patterns
├── ISEP-Testing-Plan.md         ← Tech stack in Docker, MCP server design
├── coverage/                   ← Generated: Jest (and later backend) coverage reports
│   └── frontend/                ← Open index.html for L1 coverage
├── results/                    ← Generated: JUnit XML, Playwright reports (when added)
└── Test Cases/
    ├── ISEP-TEST-CASES-INDEX.md ← Master index of all TCs
    ├── ISEP-TC-01-Auth-RBAC.md
    ├── ISEP-TC-02-Paper-Approval.md
    ├── ISEP-TC-03-AI-Features.md
    ├── ISEP-TC-04-All-Modules.md
    ├── ISEP-TC-05-API-Contracts.md
    └── ISEP-TC-06-UAT-SeaFireFighting.md
```

---

## Context loading (Cursor / automation)

**Load only what you need:**

| When you're… | Load these files |
|--------------|-------------------|
| **Approval chain work** (paper drafting, 7-stage flow, state machine) | `ISEP-TESTING-CONTEXT.md` + `Test Cases/ISEP-TC-02-Paper-Approval.md` |
| **Full UAT** (end-to-end meeting lifecycle, Sea Fire Fighting) | `Test Cases/ISEP-TC-06-UAT-SeaFireFighting.md` |
| Auth, RBAC, RLS | `ISEP-TESTING-CONTEXT.md` + `Test Cases/ISEP-TC-01-Auth-RBAC.md` |
| AI features (Position Advisor, Preparedness, Draft Assistant) | `ISEP-TESTING-CONTEXT.md` + `Test Cases/ISEP-TC-03-AI-Features.md` |
| All modules / 70 screens | `Test Cases/ISEP-TC-04-All-Modules.md` |
| API contracts (Kong, 70 routes × roles) | `Test Cases/ISEP-TC-05-API-Contracts.md` |

---

## TC-06: Dual purpose

**ISEP-TC-06-UAT-SeaFireFighting.md** is:

1. **Playwright E2E script blueprint** — Step-by-step scenarios (TC-06-UAT-001 through TC-06-UAT-018) that can be implemented as Playwright specs for full UAT automation.
2. **Formal UAT sign-off checklist for DGS** — The **18-row UAT Sign-Off Checklist** at the end of the document is ready to **print and sign**. DGS stakeholders (e.g. IC Division Head) use it to record Result and Sign-Off for each of the 18 UAT scenarios.

---

## Quick ref

- **Test case index:** `Test Cases/ISEP-TEST-CASES-INDEX.md`
- **Architecture & layers:** `ISEP-TESTING-CONTEXT.md`
- **Docker + MCP plan:** `ISEP-Testing-Plan.md`
