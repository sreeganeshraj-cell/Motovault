# ADR-001: Clean Architecture

## Date
2026-06-08

## Status
Accepted

## Decision
MotoVault uses Clean Architecture with 4 layers:
**Domain → Application → Infrastructure → API**

## Layer Responsibilities

| Layer | Project | Knows about | Never knows about |
|---|---|---|---|
| Domain | MotoVault.Domain | Nothing external | EF Core, HTTP, DB |
| Application | MotoVault.Application | Domain | EF Core, HTTP, PostgreSQL |
| Infrastructure | MotoVault.Infrastructure | Domain + Application | HTTP, controllers |
| API | MotoVault.API | Application | EF Core, Dapper directly |

## Dependency Rule
**Dependencies point inward only.**
Domain knows nothing. Application knows Domain. Infrastructure knows both. API knows Application.

## Reason
- Präferenzkalkulation and MotoVault domain logic must be testable without a database
- Swap PostgreSQL for another database → only Infrastructure changes
- Add a Worker Service or gRPC host later → reuses Application layer unchanged
- Business rules stay in Domain, not scattered across controllers or repositories

## Consequences
- All domain objects in `Domain/Entities`, `Domain/ValueObjects`, `Domain/Enums`
- No EF Core attributes on domain entities — configurations live in `Infrastructure/Persistence/Configurations/`
- Interfaces defined in Application (`Application/Interfaces/Repositories/`) — implemented in Infrastructure
- No `DbContext` reference in Application or Domain
- Controllers never contain business logic

## Related
- [[Architecture/CQRS-Pattern]]
- [[Architecture/ADR-002-CQRS-EF-Dapper]]
