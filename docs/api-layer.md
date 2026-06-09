# API Layer — MotoVault

## What is the API Layer?
The API layer is the entry point to the system. It receives HTTP requests, translates them into Application commands and queries, and returns HTTP responses. It knows about the Application layer but has no direct knowledge of the database, domain entities, or business rules.

---

## What it contains

### 1. Controllers (`Controllers/`)
Each controller handles one resource area. Controllers are intentionally thin — they extract data from the request, dispatch a MediatR command or query, and return the result. No business logic lives here.

| Controller | Routes | Operations |
|---|---|---|
| `UsersController` | `api/Users` | GetAll, GetById, Create, Update, Delete |
| `VehiclesController` | `api/Vehicles` | GetAll, GetById, GetByOwner, Create, Update, Delete |
| `StorageSlotsController` | `api/StorageSlots` | GetAll, GetById, GetAvailable, Create, UpdateStatus |
| `PackagesController` | `api/Packages` | GetAll, GetById, Create, Update, Retire, Reactivate |
| `SubscriptionsController` | `api/Subscriptions` | GetAll (Admin), GetById, GetByVehicle, GetActive, Create, Cancel, Complete |
| `ServiceLogsController` | `api/ServiceLogs` | GetById, GetByVehicle, GetBySubscription, Create, Update |
| `ServiceMediaController` | `api/ServiceMedia` | GetById, GetByServiceLog, Create, Delete |

---

### 2. How a request flows through the system

Every request follows the same path:

```
HTTP Request
    → Controller (extracts parameters, builds command/query)
        → MediatR (dispatches to the correct handler)
            → Command Handler (writes via EF Core repository)
            → Query Handler (reads via Dapper)
        → Response DTO
    → HTTP Response (200 / 201 / 204 / 404 / 400)
```

**Example — creating a subscription:**
1. `POST /api/Subscriptions` arrives with `{ vehicleId, packageId, slotId, startDate }`
2. `SubscriptionsController.Create` builds a `CreateSubscriptionCommand` and sends it via MediatR
3. `CreateSubscriptionCommandHandler` validates the vehicle, package, and slot — then calls `vehicle.AddSubscription()` and `slot.MarkOccupied()`
4. The handler returns a `SubscriptionResponse` with the full enriched result
5. The controller returns `201 Created` with the response body and a `Location` header pointing to `GET /api/Subscriptions/{id}`

The controller has no knowledge of what `vehicle.AddSubscription()` does — it only knows the contract.

---

### 3. Notable route patterns

| Pattern | Example | Purpose |
|---|---|---|
| Sub-resource by parent | `GET /api/ServiceLogs/vehicle/{vehicleId}` | Fetch all logs for a vehicle |
| State transitions | `PUT /api/Subscriptions/{id}/cancel` | Cancel a specific subscription |
| Filtered list | `GET /api/StorageSlots/available?type=Car` | Get available car slots |
| Nested media | `GET /api/ServiceMedia/service-log/{serviceLogId}` | Get all media for a service log |

---

### 4. Global Exception Handler (`Infrastructure/GlobalExceptionHandler.cs`)
Catches unhandled exceptions from any handler and maps them to appropriate HTTP responses. Controllers never contain try/catch blocks — exception handling is a cross-cutting concern handled once here.

| Exception | HTTP Status | When it occurs |
|---|---|---|
| `KeyNotFoundException` | `404 Not Found` | Entity not found by ID |
| `InvalidOperationException` | `400 Bad Request` | Business rule violated (e.g. slot already occupied) |
| `ArgumentException` | `400 Bad Request` | Invalid input (e.g. empty file URL) |
| Any other | `500 Internal Server Error` | Unexpected failure |

All errors are returned as `ProblemDetails` JSON — a standard format that includes `status`, `title`, and `detail`.

---

### 5. Authentication & Authorisation
All endpoints (except `POST /api/Auth/login` and `POST /api/Auth/register`) require a valid JWT bearer token. The token is issued on login and contains the user's `Id`, `Name`, and `Role`.

Role-based access is enforced with `[Authorize(Roles = "...")]`:
- `Admin` — full access including user management, slot management, all subscriptions
- `Staff` — can create and view service logs; cannot manage users or packages
- `Owner` — can view their own vehicles, subscriptions, and service history

---

### 6. JSON Serialisation
Enums are serialised as strings (`"Active"` not `0`). This makes API responses readable without needing a separate enum reference — a client sees `"ServiceType": "Cleaning"` rather than `"ServiceType": 2`.

---

### 7. Program.cs
Bootstraps the application in order:

```
AddControllers (with string enum serialisation)
AddOpenApi (schema available at /openapi/v1.json in Development)
AddApplication (MediatR + LoggingBehavior — from Application layer)
AddInfrastructure (DbContext + repositories + connection factory — from Infrastructure layer)
AddExceptionHandler (GlobalExceptionHandler)
AddProblemDetails
```

---

### 8. ApplicationExtensions (`Application/Extensions/ApplicationExtensions.cs`)
Registers MediatR and the `LoggingBehavior` pipeline behavior. Kept in the Application project (not here) so the Application layer is self-contained and could be used with a different host — a Worker Service, a gRPC server, or a test host — without pulling in the API project.

---

## What the API layer does NOT do
- No business rules — a controller never decides whether a slot is available
- No direct database access — no `DbContext` or SQL in controllers
- No domain entity exposure — only DTOs cross the HTTP boundary

Keeping controllers thin means the same business logic can be reused by a future worker service, a scheduled job, or a CLI tool without duplicating a single rule.
