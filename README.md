# IMO Strategic Engagement Platform (ISEP)

Meeting collaboration platform — internal digital platform for DGS (Directorate General of Shipping), MoPSW, Government of India — managing India's engagement with IMO, ILO, IMSO and related bodies.

## Repository Structure

- **frontend/** — Next.js 14+ (App Router), TypeScript, Radix UI, Tailwind CSS
- **backend/** — Spring Boot 3.x microservices (Java 21)
- **workflow-service/** — Python FastAPI + Celery + Redis
- **infrastructure/** — Docker, Kong, Nginx, deployment configs
- **database/** — PostgreSQL migrations and seeds
- **docs/** — HLD, LLD, runbooks
- **SRS/** — Software Requirements Specification (reference)

## Quick Start (Development)

1. Start infrastructure: `cd infrastructure/docker && docker compose -f docker-compose.dev.yml up -d`
2. Run database migrations: `cd database && ./run-migrations.sh` (or use Flyway)
3. Start backend: `cd backend/meeting-service && ./mvnw spring-boot:run`
4. Start workflow-service: `cd workflow-service && uvicorn app.main:app --reload`
5. Start frontend: `cd frontend && npm run dev`

See [docs/development.md](docs/development.md) for detailed setup.

## Documentation

- [SRS Master](SRS/SRS-00-Master.md) — Full requirements and document index
- [Development Plan](.cursor/plans/) — Phased implementation plan
