# ISEP Development Setup

## Prerequisites

- Node.js 20+, npm/pnpm
- Java 21 (OpenJDK)
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

## Environment Variables

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — PostgreSQL connection string
- `KEYCLOAK_*` — Keycloak realm and client settings
- `REDIS_URL` — Redis for Celery and cache
- `MINIO_*` — Object storage for documents

## Running the Stack

See README.md Quick Start. Full stack can be brought up via Docker Compose for local development.

## SRS Reference

All implementation must align with the SRS documents in `SRS/`. Key volumes:

- SRS-03: Functional Requirements (Modules A–K)
- SRS-04: Technical Architecture
- SRS-06: Data Model
