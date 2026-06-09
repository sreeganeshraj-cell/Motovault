# Domain Entities — MotoVault

All entities use **private setters** and **static `Create()` factory methods**.
Never set properties directly from outside the domain layer.

---

## User
Represents anyone who interacts with MotoVault.

| Property | Type | Notes |
|---|---|---|
| Id | Guid | |
| Name | string | |
| Email | string | Unique |
| PasswordHash | string | Bcrypt hashed |
| Role | Role (enum) | Owner / Admin / Staff |
| ContactInfo | ContactInfo | Value object |

**Roles:** See [[Roles]]

---

## Vehicle
A customer's motorcycle or car stored at MotoVault.

| Property | Type | Notes |
|---|---|---|
| Id | Guid | |
| OwnerId | Guid | FK → User |
| Brand | string | e.g. Royal Enfield |
| Model | string | e.g. Himalayan |
| Type | VehicleType (enum) | Bike / Car |
| RegistrationNumber | RegistrationNumber | Value object |
| Subscriptions | IReadOnlyList | Navigation |
| ServiceLogs | IReadOnlyList | Navigation |

**Aggregate root.** Enforces: `vehicle.AddSubscription()` throws if a duplicate active subscription exists.

---

## StorageSlot
A physical parking spot inside the MotoVault garage.

| Property | Type | Notes |
|---|---|---|
| Id | Guid | |
| SlotNumber | string | e.g. "C-01", "B-07" |
| Type | VehicleType | Bike or Car |
| Status | SlotStatus | Available / Occupied |

**Fixed capacity: 15 Car slots + 15 Bike slots. Never exceed this.**

Domain methods: `slot.MarkOccupied()` · `slot.MarkAvailable()`

---

## Package
A care plan a customer subscribes to.

| Property | Type | Notes |
|---|---|---|
| Id | Guid | |
| Name | string | Essential / RoadReady / Concierge |
| Description | string | |
| Price | decimal | Monthly rate |
| IsActive | bool | Retired packages stay in DB |

**No delete allowed** — packages are referenced by existing subscriptions.
Use `RetirePackageCommand` / `ReactivatePackageCommand` instead.

---

## Subscription
The active agreement between a vehicle, a package, and a storage slot.

| Property | Type | Notes |
|---|---|---|
| Id | Guid | |
| VehicleId | Guid | FK → Vehicle |
| PackageId | Guid | FK → Package |
| StorageSlotId | Guid | FK → StorageSlot |
| Period | DateRange | Value object (StartDate + EndDate) |
| Status | SubscriptionStatus | Active / Completed / Cancelled |

**Central record** — ties vehicle to slot and care plan.
One vehicle = one active subscription at a time.

Status transitions: `Active → Completed` or `Active → Cancelled`
Both transitions must free the StorageSlot (`slot.MarkAvailable()`).

---

## ServiceLog
A record of every service activity performed on a vehicle.

| Property | Type | Notes |
|---|---|---|
| Id | Guid | |
| VehicleId | Guid | FK → Vehicle |
| SubscriptionId | Guid | FK → Subscription |
| ServiceType | ServiceType (enum) | Cleaning / Idling / Ride / Service |
| Notes | string | Staff notes |
| ServicedAt | DateTime | When performed |
| CreatedById | Guid | FK → User (staff member) |
| Media | IReadOnlyList | Attached photos/videos |

**No delete** — ServiceLog is an audit trail. Immutable after creation.

---

## ServiceMedia
Photos and videos attached to a service log.

| Property | Type | Notes |
|---|---|---|
| Id | Guid | |
| ServiceLogId | Guid | FK → ServiceLog |
| Url | string | `/uploads/media/{guid}.ext` |
| MediaType | MediaType (enum) | Image / Video |

**Only entity that allows delete.** Files saved to `wwwroot/uploads/media/`.
Cascade delete from ServiceLog — if log is removed, media is removed.

---

## Value Objects

### RegistrationNumber
Wraps the vehicle registration string. Enforces format validation.
Stored as a single `RegistrationNumber` column in the database (EF Core owned type).

### DateRange
Wraps `StartDate` and `EndDate` for a Subscription period.
Stored as two columns: `StartDate` and `EndDate` (EF Core owned type).

### ContactInfo
Wraps contact details for a User (phone, address etc.)

---

## Enums

| Enum | Values |
|---|---|
| Role | Owner, Admin, Staff |
| VehicleType | Bike, Car |
| SlotStatus | Available, Occupied |
| SubscriptionStatus | Active, Completed, Cancelled |
| ServiceType | Cleaning, Idling, Ride, Service |
| MediaType | Image, Video |

All enums stored as **strings** in the database — readable without a reference table.

---

## Related
- [[Domain/BusinessRules]]
- [[Domain/Roles]]
- [[Architecture/CQRS-Pattern]]
