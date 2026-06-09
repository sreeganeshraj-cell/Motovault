# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (.NET 10)
Run from `d:\Magic of AI\Motovault\` (solution root):
```bash
dotnet build
dotnet run --project src/MotoVault.API
dotnet test
```

EF Core migrations (run from solution root):
```bash
dotnet ef migrations add <Name> --project src/MotoVault.Infrastructure --startup-project src/MotoVault.API
dotnet ef database update --project src/MotoVault.Infrastructure --startup-project src/MotoVault.API
```

### Frontend (React + Vite)
Run from `web/motovault-web/`:
```bash
npm run dev      # dev server on :5173, proxies /api and /uploads to :5163
npm run build    # tsc -b && vite build
npm run lint     # ESLint
```

## Architecture

MotoVault is a motorbike storage/service management app. Clean Architecture with CQRS.

```
MotoVault.Domain          — Entities, ValueObjects, Enums (no framework deps)
MotoVault.Application     — Commands, Queries, DTOs, Repository interfaces
MotoVault.Infrastructure  — EF Core, Dapper, Repositories, JWT, Seeders
MotoVault.API             — ASP.NET Core controllers, Program.cs, GlobalExceptionHandler
web/motovault-web/        — React 19 + Vite frontend
```

### Request Flow
```
HTTP → Controller (thin, extracts params) → mediator.Send() → Handler → Repository/Domain → DTO → HTTP response
```

Controllers do nothing except map HTTP input to a command/query record and return the result. All logic lives in handlers.

### CQRS with MediatR

**Writes (Commands)** — load aggregate via EF Core repo, call domain method, save, return DTO:
```csharp
public record CreatePackageCommand(string Name, decimal Price) : IRequest<PackageResponse>;

public class CreatePackageCommandHandler : IRequestHandler<CreatePackageCommand, PackageResponse>
{
    private readonly IPackageRepository _repo;
    public async Task<PackageResponse> Handle(CreatePackageCommand req, CancellationToken ct)
    {
        var package = Package.Create(req.Name, req.Price);
        await _repo.AddAsync(package);
        return new PackageResponse { Id = package.Id, Name = package.Name, ... };
    }
}
```

**Reads (Queries)** — use Dapper directly for raw SQL with JOINs, return DTOs:
```csharp
public class GetAllSubscriptionsQueryHandler : IRequestHandler<GetAllSubscriptionsQuery, IEnumerable<SubscriptionResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;
    public async Task<IEnumerable<SubscriptionResponse>> Handle(...)
    {
        using var conn = _connectionFactory.CreateConnection();
        return await conn.QueryAsync<SubscriptionResponse>("SELECT s.*, p.Name as PackageName ...", params);
    }
}
```

### EF Core vs Dapper
- **EF Core** — writes only. Repositories implementing `I*Repository` in `Infrastructure/Persistence/Repositories/`. Use `GetByIdAsync` (tracked) for entities you'll mutate, `GetAllAsync` with `.AsNoTracking()` for list reads you won't mutate.
- **Dapper** — reads only. Query handlers use `IDbConnectionFactory` (Npgsql) to run raw SQL. No change tracking overhead.
- **Critical**: New child entities (with non-default GUIDs) added to an aggregate's collection get tracked as `Modified`, not `Added`, when saved via `UpdateAsync` on the parent. Always use the child entity's own repository `AddAsync` instead. See `CreateServiceLogCommandHandler` for the pattern.

### Domain Entities
Entities use private setters and static `Create()` factory methods. Aggregates (`Vehicle`, `Subscription`) enforce business rules in domain methods (e.g., `vehicle.AddSubscription()` throws if a duplicate active subscription exists). Never set properties directly from outside the domain.

### File Uploads (ServiceMedia)
- Files saved to `{ContentRootPath}/wwwroot/uploads/media/`
- URL stored as relative path `/uploads/media/{guid}.ext`
- `Program.cs` ensures the directory exists at startup and configures `UseStaticFiles` with an explicit `PhysicalFileProvider` (because `WebRootPath` is null if `wwwroot` didn't exist at first launch)
- Vite proxies `/uploads` → `http://localhost:5163` in development

## Frontend Patterns

### API Client
`src/api/client.ts` — Axios instance with `baseURL: '/api'`. The request interceptor attaches the JWT from Zustand. The response interceptor redirects to `/login` on 401.

**File uploads** — The axios instance has `Content-Type: application/json` as a default. Axios v1.x JSON-stringifies FormData when that default is present. All `upload()` calls must override `transformRequest` to clear the Content-Type and let the browser set the multipart boundary:
```typescript
apiClient.post('/ServiceMedia/upload', fd, {
  transformRequest: [(data: unknown, headers: Record<string, unknown>) => {
    delete headers['Content-Type']
    return data
  }],
})
```

### State & Data Fetching
- **TanStack Query** — all server state. `queryKey` conventions: `['packages']`, `['vehicles']`, `['service-logs']`, `['service-media', logId]`, `['subscription', 'active', vehicleId]`.
- **Zustand** (`authStore`) — JWT token + user persisted to `localStorage`. Access via `useAuthStore()` or `useAuthStore.getState()` outside components.
- **React Hook Form + Zod** — all forms. Define schema → `zodResolver` → `register`/`handleSubmit`.

### Role-Based Access
Three roles: `Admin`, `Staff`, `Owner`. Routes are guarded by `<ProtectedRoute>` (auth) and `<RoleGuard roles={[...]}>` (role). Backend endpoints use `[Authorize(Roles = "Admin,Staff")]` etc.

## Key Configuration Files

| File | Purpose |
|---|---|
| `src/MotoVault.API/appsettings.json` | PostgreSQL connection string, JWT secret/issuer, admin seed credentials |
| `web/motovault-web/vite.config.ts` | Vite proxies: `/api` and `/uploads` → `http://localhost:5163` |
| `src/MotoVault.Infrastructure/Extensions/InfrastructureExtensions.cs` | DI registration for all repos, services, EF Core, auth |
| `src/MotoVault.Application/Extensions/ApplicationExtensions.cs` | MediatR + pipeline behaviors registration |

## Docs
Detailed domain/layer documentation lives in `docs/`: `overview.md`, `domain-layer.md`, `application-layer.md`, `infrastructure-layer.md`, `api-layer.md`, `roles.md`, `features.md`, `tech-constraints.md`.
