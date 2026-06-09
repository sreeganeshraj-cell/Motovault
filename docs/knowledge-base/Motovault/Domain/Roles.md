# Roles — MotoVault

Three roles exist in the system. Role is stored on the User entity and enforced via
JWT claims + `[Authorize(Roles = "...")]` on API controllers.

---

## Owner (Customer)
A vehicle owner who stores their bike or car at MotoVault.

**Can:**
- Register and manage their own vehicles
- View available packages and subscribe
- View their own subscriptions and status
- View service logs and media for their vehicles
- View their service history

**Cannot:**
- See other owners' data
- Manage slots, packages, or users
- Create or edit service logs

---

## Admin (MotoVault Operator)
The garage manager who runs MotoVault operations.

**Can:**
- Everything Staff can do
- Manage storage slots (create, update status)
- Manage packages (create, update, retire, reactivate)
- Approve subscriptions
- Manage all users (create, update, delete)
- View all subscriptions across all vehicles
- View dashboard summary and stats

---

## Staff (Service Team)
Garage staff who physically service and care for vehicles.

**Can:**
- Create service logs for any vehicle
- Upload photos and videos to service logs
- View vehicles and their service history

**Cannot:**
- Manage users, packages, or slots
- Approve or cancel subscriptions
- Access dashboard stats

---

## Role Enforcement

| Endpoint area | Owner | Staff | Admin |
|---|---|---|---|
| Own vehicles | ✅ | ❌ | ✅ |
| All vehicles | ❌ | ✅ (view) | ✅ |
| Slots | ❌ | ❌ | ✅ |
| Packages | ✅ (view) | ✅ (view) | ✅ |
| Own subscriptions | ✅ | ❌ | ✅ |
| All subscriptions | ❌ | ❌ | ✅ |
| Service logs | ✅ (view own) | ✅ (create/view) | ✅ |
| Users | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ❌ | ✅ |

---

## Related
- [[Domain/Entities]]
- [[Domain/BusinessRules]]
