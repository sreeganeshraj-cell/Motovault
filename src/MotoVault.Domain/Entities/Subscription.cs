using MotoVault.Domain.Common;
using MotoVault.Domain.Enums;
using MotoVault.Domain.ValueObjects;

namespace MotoVault.Domain.Entities;

public class Subscription : Entity
{
    public Guid VehicleId { get; private set; }
    public Guid PackageId { get; private set; }
    public Guid SlotId { get; private set; }
    public DateRange Period { get; private set; } = null!;
    public SubscriptionStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public Package Package { get; private set; } = null!;
    public StorageSlot Slot { get; private set; } = null!;

    private Subscription() { }

    internal static Subscription Create(Guid vehicleId, Guid packageId, Guid slotId, DateOnly startDate, DateOnly? endDate = null, SubscriptionStatus status = SubscriptionStatus.Active)
    {
        return new Subscription
        {
            VehicleId = vehicleId,
            PackageId = packageId,
            SlotId = slotId,
            Period = new DateRange(startDate, endDate),
            Status = status
        };
    }

    public void Approve()
    {
        if (Status != SubscriptionStatus.Requested)
            throw new InvalidOperationException("Only requested subscriptions can be approved.");

        Status = SubscriptionStatus.Active;
    }

    public void Cancel(DateOnly endDate)
    {
        if (Status != SubscriptionStatus.Active && Status != SubscriptionStatus.Requested)
            throw new InvalidOperationException("Only active or pending subscriptions can be cancelled.");

        Period = Period.Close(endDate);
        Status = SubscriptionStatus.Cancelled;
    }

    public void Complete(DateOnly endDate)
    {
        if (Status != SubscriptionStatus.Active)
            throw new InvalidOperationException("Only active subscriptions can be completed.");

        Period = Period.Close(endDate);
        Status = SubscriptionStatus.Completed;
    }
}
