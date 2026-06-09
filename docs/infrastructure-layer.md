# Infrastructure Layer — MotoVault

## What is the Infrastructure Layer?
The Infrastructure layer is where everything connects to the real world. It implements the interfaces defined in the Application layer — turning abstract contracts into actual database calls, file access, and external service integrations. The rest of the application never knows these details; it only sees the interfaces.

---

## What it contains

### 1. Repositories (`Persistence/Repositories/`)
Each repository implements one `IRepository` interface from the Application layer. They are the only place in the codebase that directly touches the database.

MotoVault uses a split strategy: **EF Core for writes, Dapper for reads**.

| Repository | Implements | Key Operations |
|---|---|---|
| `UserRepository` | `IUserRepository` | GetById, GetAll, Add, Update, Delete |
| `VehicleRepository` | `IVehicleRepository` | GetById (includes Subscriptions + ServiceLogs), GetAll, GetByOwner, Add, Update, Delete |
| `StorageSlotRepository` | `IStorageSlotRepository` | GetById, GetAll, GetAvailableByType, Add, Update |
| `PackageRepository` | `IPackageRepository` | GetById, GetAll, Add, Update |
| `SubscriptionRepository` | `ISubscriptionRepository` | GetById, GetAll, GetByVehicle, GetActiveByVehicle, Add, Update |
| `ServiceLogRepository` | `IServiceLogRepository` | GetById, GetByVehicle, GetBySubscription, Add, Update |
| `ServiceMediaRepository` | `IServiceMediaRepository` | GetById, GetByServiceLog, Add, Delete |

**Why EF Core for writes?**
Writes go through EF Core because it understands the domain model — owned types like `DateRange` and `RegistrationNumber`, navigation properties like `Vehicle._subscriptions`, and cascade rules. Writing these manually in SQL would be fragile and verbose.

**Why Dapper for reads?**
Reads use Dapper with raw SQL because queries often need JOIN results and computed fields — for example, `ServiceLogResponse` includes `VehicleRegistrationNumber`, `CreatedByName`, and `MediaCount`, none of which exist as single columns. Dapper maps these directly to response DTOs in one round trip, without loading full entity graphs.

**Why `AsNoTracking()` on list reads?**
List methods like `GetAllAsync` and `GetByVehicleIdAsync` use `AsNoTracking()` because the returned data is never mutated — tracking it wastes memory and CPU. `GetByIdAsync` does *not* use `AsNoTracking` because command handlers load an entity, mutate it, and save it back.

---

### 2. AppDbContext (`Persistence/AppDbContext.cs`)
The EF Core database context. It exposes a `DbSet<T>` for each entity and applies all configurations by scanning the assembly for `IEntityTypeConfiguration<T>` implementations.

```
DbSet<User>         → Users table
DbSet<Vehicle>      → Vehicles table
DbSet<StorageSlot>  → StorageSlots table
DbSet<Package>      → Packages table
DbSet<Subscription> → Subscriptions table
DbSet<ServiceLog>   → ServiceLogs table
DbSet<ServiceMedia> → ServiceMedia table
```

---

### 3. Entity Configurations (`Persistence/Configurations/`)
Each entity has a dedicated configuration class that maps domain properties to database columns. This keeps the domain model clean — no EF Core attributes on entities.

Key mapping decisions:

| Entity | Notable Mapping |
|---|---|
| `Vehicle` | `RegistrationNumber` (value object) owned, flattened to a single `RegistrationNumber` column |
| `Subscription` | `Period` (value object) owned, split into `StartDate` and `EndDate` columns |
| `ServiceLog` | `ServiceType` stored as string, not integer — readable in the database |
| `ServiceMedia` | `MediaType` stored as string, cascade delete from `ServiceLog` |
| `StorageSlot` | `SlotStatus` stored as string |

---

### 4. NpgsqlConnectionFactory (`Services/NpgsqlConnectionFactory.cs`)
Implements `IDbConnectionFactory`. Creates a fresh `NpgsqlConnection` on demand for Dapper queries. Registered as a singleton since it holds only the connection string, not the connection itself.

---

### 5. DI Registration (`Extensions/InfrastructureExtensions.cs`)
A single `AddInfrastructure(IConfiguration)` extension method that wires up everything:
- `AppDbContext` with the PostgreSQL connection string
- All 7 repositories as scoped services
- `NpgsqlConnectionFactory` as a singleton

Call this once from `Program.cs` — no other layer needs to know about EF Core or Npgsql.

---

### 6. Migrations (`Persistence/Migrations/`)
EF Core migrations track every schema change as versioned C# files. The current migration `InitialCreate` creates all 7 tables and the `__EFMigrationsHistory` tracking table in PostgreSQL.

To apply migrations:
```
dotnet ef database update --project src/MotoVault.Infrastructure --startup-project src/MotoVault.API
```

To add a new migration after a domain change:
```
dotnet ef migrations add <MigrationName> --project src/MotoVault.Infrastructure --startup-project src/MotoVault.API
```

---

## What Infrastructure does NOT do
- No business rules — those live in the Domain
- No request/response shaping — that belongs in Application DTOs
- No HTTP or controller logic — that belongs in the API layer

Infrastructure is a pure implementation detail. Swap PostgreSQL for another database and only this layer changes.
