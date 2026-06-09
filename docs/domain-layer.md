# Domain Layer — MotoVault

## What is the Domain Layer?
The Domain layer is the core of the application. It contains only the business data — nothing about databases, APIs, or frameworks. Just plain C# classes that represent the real-world concepts of MotoVault.

---

## Entities

### User
Represents anyone who interacts with MotoVault — a vehicle owner, an admin managing the garage, or a staff member performing services. The `Role` field (Owner / Admin / Staff) determines what they can do in the system.

### Vehicle
A customer's bike or car stored at MotoVault. Every vehicle is linked to an `Owner` (a User). It holds the registration number, brand, model, and type (Bike or Car) — the details staff need to identify and care for the vehicle.

### StorageSlot
A physical parking spot inside the MotoVault garage. Each slot has a number, a type (Bike or Car), and a status (Available or Occupied). MotoVault has a fixed capacity — 15 car slots and 15 bike slots — so slot management is critical.

### Package
A care plan a customer subscribes to. The three plans are Essential Care, RoadReady Care, and Concierge Care — each with different levels of service and pricing. Stored as data so new packages can be added without code changes.

### Subscription
The active agreement between a customer's vehicle and a chosen package, assigned to a specific storage slot. It tracks the start date, end date, and current status (Active / Completed / Cancelled). This is the central record that ties a vehicle to its slot and care plan.

### ServiceLog
A record of every service activity performed on a vehicle — cleaning, engine idling, a road run, or a full service visit. Logged by staff with the date, type of service, and any notes. This is MotoVault's key trust-building feature — customers can see exactly what was done and when.

### ServiceMedia
Photos and videos attached to a service log. When staff clean or run a vehicle, they upload media as proof. This is what makes MotoVault transparent and premium — owners get visual evidence of every service activity.

---

## Enums

| Enum | Values | Used In |
|------|--------|---------|
| `Role` | Owner, Admin, Staff | User |
| `VehicleType` | Bike, Car | Vehicle, StorageSlot |
| `SlotStatus` | Available, Occupied | StorageSlot |
| `SubscriptionStatus` | Active, Completed, Cancelled | Subscription |
| `ServiceType` | Cleaning, Idling, Ride, Service | ServiceLog |
| `MediaType` | Image, Video | ServiceMedia |

---

## Why no logic here?
The Domain layer has no EF Core, no Dapper, no HTTP — just data shapes. This means:
- It can be tested without a database
- It can be reused across any layer
- Business rules stay in one place, not scattered across the codebase
