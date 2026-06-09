# Application Layer — MotoVault

## What is the Application Layer?
The Application layer sits between the Domain and the outside world. It defines the full contract of the system — what operations exist, what data goes in, and what comes back. It knows about the Domain but has zero knowledge of databases, HTTP, or frameworks.

---

## What it contains

### 1. Repository Interfaces (`Interfaces/Repositories/`)
Contracts that define what data operations are needed. The Application layer says *"I need to be able to fetch a vehicle by owner"* — it doesn't care if that comes from PostgreSQL, an in-memory list, or an external API. The actual database code lives in Infrastructure and plugs in later.

| Interface | Purpose |
|-----------|---------|
| `IUserRepository` | CRUD for users |
| `IVehicleRepository` | CRUD + fetch by owner |
| `IStorageSlotRepository` | CRUD + fetch available slots by type |
| `IPackageRepository` | CRUD (no delete — referenced by subscriptions) |
| `ISubscriptionRepository` | CRUD + fetch active subscription per vehicle |
| `IServiceLogRepository` | Read + write (no delete — audit trail) |
| `IServiceMediaRepository` | Read + write + delete (only true delete in the system) |

---

### 2. CQRS — Commands & Queries (`Commands/`, `Queries/`)
Business operations are split into Commands (writes) and Queries (reads), dispatched via MediatR. Controllers send a command or query object and receive a result — they have no knowledge of how it is handled.

**Commands** (writes via EF Core):

| Command | What it does |
|---------|-------------|
| `CreateUserCommand` | Hash password, create user record |
| `CreateVehicleCommand` | Register a vehicle for an owner |
| `CreateStorageSlotCommand` | Add a new garage slot |
| `UpdateStorageSlotStatusCommand` | Mark a slot Available or Occupied |
| `CreatePackageCommand` / `UpdatePackageCommand` | Manage care packages |
| `RetirePackageCommand` / `ReactivatePackageCommand` | Toggle package active state |
| `CreateSubscriptionCommand` | Validate vehicle + slot + package, call `vehicle.AddSubscription()`, save subscription via its own repository, mark slot occupied |
| `CancelSubscriptionCommand` | Close the subscription, free the slot |
| `CompleteSubscriptionCommand` | Close the subscription, free the slot |
| `CreateServiceLogCommand` | Log a service activity through the Vehicle aggregate |
| `CreateServiceMediaCommand` | Attach a photo/video to a service log |

**Queries** (reads via Dapper):

| Query | What it returns |
|-------|----------------|
| `GetAllUsersQuery` | All users as `UserResponse[]` |
| `GetAllVehiclesQuery` / `GetVehiclesByOwnerQuery` | Vehicle list with owner name |
| `GetAllStorageSlotsQuery` | All slots with status |
| `GetAllPackagesQuery` | All packages |
| `GetAllSubscriptionsQuery` | Subscriptions with vehicle, owner, package, slot details |
| `GetAllServiceLogsQuery` / `GetServiceLogsByVehicleQuery` | Service history with media count |
| `GetDashboardSummaryQuery` | Aggregated dashboard stats + active vehicles + recent activity |

**Example — creating a subscription:**
1. Controller sends `CreateSubscriptionCommand` via MediatR
2. Handler loads vehicle (for business rule validation), slot, and package
3. Calls `vehicle.AddSubscription()` — domain enforces "no duplicate active subscription"
4. Calls `slot.MarkOccupied()`
5. Saves subscription via `ISubscriptionRepository.AddAsync()` (explicit INSERT, avoids EF Core graph traversal issue)
6. Returns `SubscriptionResponse`

---

### 3. DTOs (`DTOs/`)
Data shapes that go in and out of the API. Domain entities are never exposed directly — DTOs act as the public face of the system.

**Why separate DTOs from entities?**
- `CreateUserRequest` has no `Id` or `CreatedAt` — the client shouldn't set those
- `VehicleResponse` includes `OwnerName` — a JOIN result, not a raw entity field
- `SubscriptionResponse` includes `PackageName` and `SlotNumber` — enriched for display without extra API calls
- Different operations need different shapes — creating a package needs fewer fields than updating one

| Module | Request DTOs | Response DTO |
|--------|-------------|--------------|
| Users | Create, Update | UserResponse |
| Vehicles | Create, Update | VehicleResponse |
| StorageSlots | Create, UpdateStatus | StorageSlotResponse |
| Packages | Create, Update | PackageResponse |
| Subscriptions | Create, Update | SubscriptionResponse |
| ServiceLogs | Create, UpdateNotes | ServiceLogResponse |
| ServiceMedia | Create | ServiceMediaResponse |

---

## Why no implementation here?
The Application layer only defines *what* — never *how*. This separation means:
- You can swap PostgreSQL for another database without touching Application
- You can test business logic without a real database
- The API layer depends only on interfaces, not concrete classes — loose coupling

## What's next — Infrastructure
Infrastructure implements everything defined here:
- Repository interfaces → implemented using EF Core (writes) + Dapper (reads)
- Service interfaces → implemented using repositories + domain logic
- EF Core DbContext + migrations → recreates the database from C# models
