# ADR-002: CQRS — EF Core for Writes, Dapper for Reads

## Date
2026-06-08

## Status
Accepted

## Decision
All **write operations** use EF Core repositories.
All **read operations** use Dapper with raw SQL.

## Reason

### Why EF Core for writes?
- Domain model has owned types (`RegistrationNumber`, `DateRange`) and navigation properties
- EF Core handles change tracking, cascade saves, and complex object graphs correctly
- Writing aggregate saves manually in SQL would be fragile and error-prone

### Why Dapper for reads?
- Read queries need enriched DTOs with JOIN data across multiple tables
- Example: `SubscriptionResponse` includes `PackageName`, `SlotNumber`, `OwnerName`, `VehicleRegistration`
- Loading full entity graphs via EF Core and then mapping them is slower and more memory-intensive
- Dapper maps JOIN results directly to DTOs in one SQL round trip

## Consequences
- No EF Core usage in Query Handlers — only `IDbConnectionFactory` + Dapper
- No Dapper usage in Command Handlers — only EF Core repositories
- `GetByIdAsync` — no AsNoTracking (entity will be mutated)
- `GetAllAsync` — AsNoTracking (read-only list, no mutation)
- Critical: child entities added to aggregates must use child repo `AddAsync()`, not parent `UpdateAsync()` — see [[Domain/BusinessRules]]

## Related
- [[Architecture/CQRS-Pattern]]
- [[Architecture/ADR-001-Clean-Architecture]]
