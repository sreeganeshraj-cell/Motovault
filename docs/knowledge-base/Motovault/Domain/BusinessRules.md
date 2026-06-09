# Business Rules — MotoVault

Critical rules that the domain enforces. These must never be broken regardless of
what any API call or UI action requests.

---

## Slot Capacity Rules
- **Fixed capacity: 15 Car slots + 15 Bike slots. Total: 30 slots maximum.**
- A Bike slot can only hold a Bike subscription. A Car slot can only hold a Car subscription.
- A slot can only be `Occupied` by one active subscription at a time.
- When a subscription is Cancelled or Completed → slot must be marked `Available` immediately.

---

## Subscription Rules
- A vehicle can only have **one active subscription** at a time.
- Enforced in domain: `vehicle.AddSubscription()` throws `InvalidOperationException` if an active subscription already exists.
- Valid status transitions: `Active → Completed` · `Active → Cancelled`
- A Pending subscription must be explicitly approved by Admin before becoming Active. See [[Features/SubscriptionPackages]].

---

## Service Log Rules
- ServiceLog is an **audit trail — no deletes allowed.**
- A ServiceLog must always belong to a Vehicle and a Subscription.
- ServiceMedia is always attached to a ServiceLog — never standalone.
- Staff create service logs. Owners can only view them, never create or modify.

---

## Package Rules
- Packages are **never hard deleted** — they are referenced by existing subscriptions.
- Use `RetirePackageCommand` to hide a package from new bookings.
- Use `ReactivatePackageCommand` to restore it.
- Price and name can be updated but historical subscriptions reflect the price at the time of booking.

---

## User / Auth Rules
- Passwords are **bcrypt hashed** — never stored in plain text.
- JWT tokens are issued on login and validated per request.
- Role-based access:
  - `Owner` — sees only their own vehicles, subscriptions, service history
  - `Staff` — creates and views service logs; cannot manage users, packages, or slots
  - `Admin` — full access to everything

---

## File Upload Rules
- Media files saved to: `wwwroot/uploads/media/{guid}.ext`
- URL stored as relative path: `/uploads/media/{guid}.ext`
- When a ServiceMedia record is deleted, the file must also be deleted from disk.
- Axios multipart uploads must override `transformRequest` to clear Content-Type header — otherwise Axios JSON-stringifies the FormData.

---

## EF Core Critical Rules
- **Child entities added to an aggregate collection must use their own repository `AddAsync()`.**
  - Wrong: add child to parent collection, call parent `UpdateAsync()` — EF Core marks child as `Modified` not `Added`
  - Right: call `childRepository.AddAsync(child)` directly
  - Reference: `CreateServiceLogCommandHandler` pattern
- `GetByIdAsync` — does NOT use `AsNoTracking()` — entity will be mutated and saved
- `GetAllAsync` list methods — use `AsNoTracking()` — no mutation, saves memory

---

## Related
- [[Domain/Entities]]
- [[Architecture/CQRS-Pattern]]
- [[Features/SubscriptionPackages]]
