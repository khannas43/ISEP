# ISEP Technical Design Document (TDD) — Index

**Project:** IMO Strategic Engagement Platform (ISEP)  
**Client:** Directorate General of Shipping (DGS), MoPSW, Government of India  
**Document set version:** 1.0  
**Last updated:** 2026-02-28  

---

## Purpose

This folder contains the **Technical Design Document** for ISEP, split into four parts for easier maintenance and reading. The TDD describes the system architecture, backend APIs, frontend design, and data/integration in enough detail for development, testing, and onboarding.

---

## Document Parts

| Part | File | Description |
|------|------|-------------|
| **Part 1** | [ISEP-Technical-Design-Part1-Overview-and-Architecture.md](./ISEP-Technical-Design-Part1-Overview-and-Architecture.md) | System context, high-level architecture, technology stack, deployment view, quality attributes |
| **Part 2** | [ISEP-Technical-Design-Part2-Backend-and-APIs.md](./ISEP-Technical-Design-Part2-Backend-and-APIs.md) | Meeting-service structure, full API catalog (bodies, meetings, documents, reference, papers, feedback, CGs, notifications, reports, workflow, users, actuator), security, error handling |
| **Part 3** | [ISEP-Technical-Design-Part3-Frontend-and-UX.md](./ISEP-Technical-Design-Part3-Frontend-and-UX.md) | Next.js app structure, routing, authentication, RBAC, data flow, server/client components, server actions, key screens and patterns |
| **Part 4** | [ISEP-Technical-Design-Part4-Data-and-Integration.md](./ISEP-Technical-Design-Part4-Data-and-Integration.md) | Database schemas, migrations (V1–V12), reference data, seeds, Keycloak integration, file storage, audit |

---

## Reading Order

- **New team members / overview:** Start with **Part 1**.  
- **Backend work:** Part 1 → **Part 2** → **Part 4**.  
- **Frontend work:** Part 1 → **Part 3** → Part 2 (for API contracts).  
- **Data / DB / integration:** Part 1 → **Part 4** → Part 2.  

---

## Related Documentation

| Document | Location | Description |
|----------|----------|-------------|
| Project plan | `Plan/ISEP-Project-Plan.md` | Workstreams, activities, test accounts |
| Screen checklist & workflows | `Plan/ISEP-Screen-Checklist-and-Workflows.md` | Screens, URLs, implementation status |
| RBAC matrix | `SRS/ISEP-Screens-RBAC.md` | Screen–role matrix, route permissions |
| Backend roadmap | `Plan/ISEP-Backend-Implementation-Roadmap.md` | API implementation status |
| Database | `database/README.md` | Migrations, seeds, run instructions |
| Run application | `RUN-APPLICATION.md` | How to run full stack for testing |

---

## Maintenance

- Update the TDD when making significant architectural or API changes.  
- Keep Part 2 in sync with actual controller endpoints and DTOs.  
- Keep Part 4 in sync with migrations and schema changes.  
- Version and “Last updated” at the top of each part when editing.
