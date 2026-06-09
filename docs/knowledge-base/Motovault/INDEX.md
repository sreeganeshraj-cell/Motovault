# MotoVault — Knowledge Base Index

> A premium vehicle care and storage service for motor enthusiasts.
> *"Your vehicle is treated like it's ours."*

---

## What is MotoVault?
MotoVault is a secure, professionally managed garage where customers store their motorcycles and cars while receiving routine care, maintenance, and transparent visual updates. It targets motor enthusiasts, multi-vehicle owners, professionals with limited time, and NRIs away from home.

---

## Tech Stack
| Layer | Technology |
|---|---|
| Backend | .NET 10, ASP.NET Core |
| Architecture | Clean Architecture + CQRS (MediatR) |
| Writes | EF Core (PostgreSQL via Npgsql) |
| Reads | Dapper (raw SQL) |
| Auth | JWT Bearer tokens |
| Frontend | React 19 + Vite + TypeScript |
| State | TanStack Query + Zustand |
| Forms | React Hook Form + Zod |

---

## Project Structure
```
MotoVault.Domain          — Entities, ValueObjects, Enums
MotoVault.Application     — Commands, Queries, DTOs, Interfaces
MotoVault.Infrastructure  — EF Core, Dapper, Repositories, JWT
MotoVault.API             — Controllers, Program.cs
web/motovault-web/        — React frontend
docs/                     — Architecture docs
docs/knowledge-base/      — This Obsidian vault
```

---

## Domain Knowledge
- [[Domain/Entities]] — Vehicle, Subscription, StorageSlot, Package, ServiceLog, ServiceMedia, User
- [[Domain/Roles]] — Owner, Admin, Staff and what each can do
- [[Domain/Features]] — MVP features and future roadmap
- [[Domain/BusinessRules]] — Slot capacity, subscription logic, service flow

---

## Architecture
- [[Architecture/Overview]] — Clean Architecture layers explained
- [[Architecture/CQRS-Pattern]] — Commands (EF Core) vs Queries (Dapper)
- [[Architecture/ADR-001-Clean-Architecture]] — Why Clean Architecture
- [[Architecture/ADR-002-CQRS-EF-Dapper]] — Why split EF Core writes + Dapper reads
- [[Architecture/ADR-003-JWT-Auth]] — Authentication approach
- [[Architecture/RequestFlow]] — HTTP → Controller → MediatR → Handler → Repo → DTO

---

## Features
- [[Features/VehicleRegistration]] — Add bike/car, link to owner
- [[Features/StorageSlotManagement]] — 15 car + 15 bike slots, assign and track
- [[Features/SubscriptionPackages]] — Essential Care, RoadReady Care, Concierge Care
- [[Features/ServiceLogs]] — Record every activity with photos/videos

---

## Sprints
- [[Sprints/Sprint-01]] — Initial setup, domain, auth, vehicles
- [[Sprints/Sprint-02]] — Slots, packages, subscriptions
- [[Sprints/Sprint-03]] — Service logs, media uploads

---

## Key Business Rules
- Fixed capacity: **15 car slots + 15 bike slots** — never exceed this
- A vehicle can only have **one active subscription** at a time
- ServiceMedia is always attached to a ServiceLog — never standalone
- Roles enforce access: Owner sees their own data only, Admin sees all, Staff logs services
- New child entities added to aggregates must use their **own repository AddAsync** — not parent UpdateAsync

---

## API Controllers
| Controller | Responsibility |
|---|---|
| AuthController | Login, Register |
| VehiclesController | CRUD for vehicles |
| StorageSlotsController | Slot management |
| SubscriptionsController | Book, approve, cancel, complete |
| PackagesController | Care plan management |
| ServiceLogsController | Log service activities |
| ServiceMediaController | Upload photos/videos |
| UsersController | User management (Admin) |
| DashboardController | Summary stats |

---

## Frontend Pages
| Area | Pages |
|---|---|
| Auth | Login, Register |
| Admin | Dashboard, Vehicles, Slots, Subscriptions, Packages, ServiceLogs, Users |
| Owner | Landing, MyVehicles, MySubscription, ServiceHistory |

---

## Important Technical Notes
- **File uploads**: saved to `wwwroot/uploads/media/`, served via static files
- **Axios + FormData**: must override `transformRequest` to clear Content-Type for multipart uploads
- **EF Core child entities**: use child repo `AddAsync`, not parent `UpdateAsync`
- **Vite proxy**: `/api` and `/uploads` → `http://localhost:5163` in development
- **Background work**: Worker Service planned for weekly scheduling + notifications

---

## Quick Commands
```bash
# Backend
dotnet build
dotnet run --project src/MotoVault.API
dotnet test

# EF Core migration
dotnet ef migrations add <Name> --project src/MotoVault.Infrastructure --startup-project src/MotoVault.API
dotnet ef database update --project src/MotoVault.Infrastructure --startup-project src/MotoVault.API

# Frontend
cd web/motovault-web
npm run dev
npm run build
```
