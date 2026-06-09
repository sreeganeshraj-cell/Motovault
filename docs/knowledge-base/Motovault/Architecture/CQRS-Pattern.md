# CQRS Pattern — MotoVault

MotoVault uses CQRS (Command Query Responsibility Segregation) via MediatR.
All write operations go through Commands. All read operations go through Queries.
Controllers never call repositories directly — they always dispatch via MediatR.

---

## The Split

| | Commands (Writes) | Queries (Reads) |
|---|---|---|
| Purpose | Change state | Return data |
| Data access | EF Core repositories | Dapper raw SQL |
| Returns | Response DTO | Response DTO or list |
| Tracking | Yes (change tracking) | No (AsNoTracking / no EF) |
| Location | `Application/Commands/` | `Application/Queries/` |

---

## Why EF Core for Writes?
Writes go through EF Core because it understands the domain model:
- Owned value objects (`RegistrationNumber`, `DateRange`)
- Navigation properties (`Vehicle._subscriptions`)
- Cascade rules and change tracking
- Writing these manually in SQL would be fragile

## Why Dapper for Reads?
Reads use Dapper with raw SQL because queries need enriched DTOs:
- `SubscriptionResponse` includes `PackageName`, `SlotNumber`, `OwnerName` — all from JOINs
- `ServiceLogResponse` includes `MediaCount`, `CreatedByName`
- `DashboardSummaryDto` aggregates stats across multiple tables
- Dapper maps JOIN results directly to DTOs in one round trip, no graph loading

---

## Request Flow
```
HTTP Request
  → Controller (thin — extracts params, builds command/query record)
      → mediator.Send(command or query)
          → Command Handler — loads aggregate via EF Core repo
                            — calls domain method
                            — saves via repo
                            — returns DTO
          → Query Handler   — creates Dapper connection
                            — executes raw SQL with JOINs
                            — returns DTO
  → HTTP Response
```

---

## Command Pattern

```csharp
// 1. Command record (immutable input)
public record CreatePackageCommand(string Name, decimal Price) : IRequest<PackageResponse>;

// 2. Handler
public class CreatePackageCommandHandler : IRequestHandler<CreatePackageCommand, PackageResponse>
{
    private readonly IPackageRepository _repo;

    public async Task<PackageResponse> Handle(CreatePackageCommand req, CancellationToken ct)
    {
        var package = Package.Create(req.Name, req.Price);  // Domain factory method
        await _repo.AddAsync(package);
        return new PackageResponse { Id = package.Id, Name = package.Name, Price = package.Price };
    }
}
```

---

## Query Pattern

```csharp
// 1. Query record
public record GetAllSubscriptionsQuery : IRequest<IEnumerable<SubscriptionResponse>>;

// 2. Handler — Dapper only, no EF Core
public class GetAllSubscriptionsQueryHandler
    : IRequestHandler<GetAllSubscriptionsQuery, IEnumerable<SubscriptionResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public async Task<IEnumerable<SubscriptionResponse>> Handle(
        GetAllSubscriptionsQuery query, CancellationToken ct)
    {
        using var conn = _connectionFactory.CreateConnection();
        return await conn.QueryAsync<SubscriptionResponse>(@"
            SELECT s.*, p.Name as PackageName, ss.SlotNumber,
                   v.Brand, v.Model, u.Name as OwnerName
            FROM Subscriptions s
            JOIN Packages p ON s.PackageId = p.Id
            JOIN StorageSlots ss ON s.StorageSlotId = ss.Id
            JOIN Vehicles v ON s.VehicleId = v.Id
            JOIN Users u ON v.OwnerId = u.Id");
    }
}
```

---

## Critical: Child Entity Save Pattern

**Wrong — EF Core marks child as Modified, not Added:**
```csharp
vehicle.ServiceLogs.Add(newLog);  // adds to collection
await _vehicleRepo.UpdateAsync(vehicle);  // EF Core sees Modified, not Added → fails
```

**Correct — use child's own repository:**
```csharp
vehicle.AddServiceLog(newLog);  // domain method validates + adds to collection
await _serviceLogRepo.AddAsync(newLog);  // explicit INSERT via child repo
```

Reference implementation: `CreateServiceLogCommandHandler`

---

## MediatR Pipeline Behaviors
Registered in `ApplicationExtensions.cs`. Currently:
- `LoggingBehavior` — logs every command/query name, execution time, and result

Add new cross-cutting concerns (validation, caching) here without touching handlers.

---

## All Commands

| Command | Handler does |
|---|---|
| CreateUserCommand | Hash password, create user, save |
| CreateVehicleCommand | Create vehicle, link to owner, save |
| CreateStorageSlotCommand | Create slot, save |
| UpdateStorageSlotStatusCommand | Load slot, update status, save |
| CreatePackageCommand | Create package, save |
| UpdatePackageCommand | Load package, update fields, save |
| RetirePackageCommand | Load package, set IsActive=false, save |
| ReactivatePackageCommand | Load package, set IsActive=true, save |
| CreateSubscriptionCommand | Validate vehicle + slot + package, call domain methods, save subscription + update slot |
| BookSubscriptionCommand | Mark subscription as booked/pending |
| ApproveSubscriptionCommand | Admin approves, activates subscription |
| CancelSubscriptionCommand | Cancel subscription, free slot |
| CompleteSubscriptionCommand | Complete subscription, free slot |
| CreateServiceLogCommand | Load vehicle, call domain method, save log via ServiceLogRepository |
| UpdateServiceLogCommand | Load log, update notes, save |
| CreateServiceMediaCommand | Save file to disk, create media record |
| DeleteServiceMediaCommand | Delete file from disk, delete media record |
| LoginCommand | Validate credentials, issue JWT |
| RegisterCommand | Hash password, create user |

---

## All Queries

| Query | Returns |
|---|---|
| GetAllUsersQuery | UserResponse[] |
| GetUserByIdQuery | UserResponse |
| GetAllVehiclesQuery | VehicleResponse[] |
| GetVehicleByIdQuery | VehicleResponse |
| GetVehiclesByOwnerIdQuery | VehicleResponse[] |
| GetAllStorageSlotsQuery | StorageSlotResponse[] |
| GetStorageSlotByIdQuery | StorageSlotResponse |
| GetAvailableSlotsByTypeQuery | StorageSlotResponse[] |
| GetAllPackagesQuery | PackageResponse[] |
| GetPackageByIdQuery | PackageResponse |
| GetAllSubscriptionsQuery | SubscriptionResponse[] |
| GetSubscriptionByIdQuery | SubscriptionResponse |
| GetSubscriptionsByVehicleIdQuery | SubscriptionResponse[] |
| GetActiveSubscriptionByVehicleIdQuery | SubscriptionResponse |
| GetPendingSubscriptionsQuery | PendingSubscriptionDto[] |
| GetAllServiceLogsQuery | ServiceLogResponse[] |
| GetServiceLogByIdQuery | ServiceLogResponse |
| GetServiceLogsByVehicleIdQuery | ServiceLogResponse[] |
| GetServiceLogsBySubscriptionIdQuery | ServiceLogResponse[] |
| GetServiceMediaByIdQuery | ServiceMediaResponse |
| GetServiceMediaByServiceLogIdQuery | ServiceMediaResponse[] |
| GetDashboardSummaryQuery | DashboardSummaryDto |

---

## Related
- [[Domain/Entities]]
- [[Domain/BusinessRules]]
- [[Architecture/ADR-001-Clean-Architecture]]
