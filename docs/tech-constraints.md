# Tech Constraints

## Backend
- .NET 10
- Clean Architecture (Domain / Application / Infrastructure / API)
- CQRS with MediatR — Commands use EF Core (writes), Queries use Dapper (reads)

## Database
- PostgreSQL (via Npgsql)

## Data Access
- **EF Core for writes** — understands domain model, owned types, navigation properties, change tracking
- **Dapper for reads** — raw SQL for JOIN-heavy queries that return enriched response DTOs

## Auth
- JWT bearer tokens (issued on login, validated per request)
- Roles: Owner, Admin, Staff — enforced via `[Authorize(Roles = "...")]`

## Storage
- File storage for images/videos (local or cloud later)

## Background Processing
- Worker Service for:
  - Weekly service scheduling
  - Notifications

## Architecture Approach
- Start as a single service (modular monolith)
- Move to microservices later if needed

## Key Principle
Keep it simple. Focus on launching the business first.