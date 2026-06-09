using MotoVault.Domain.Common;
using MotoVault.Domain.Enums;

namespace MotoVault.Domain.Entities;

public class ServiceLog : Entity
{
    public Guid VehicleId { get; private set; }
    public Guid SubscriptionId { get; private set; }
    public DateOnly ServiceDate { get; private set; }
    public ServiceType ServiceType { get; private set; }
    public string? Notes { get; private set; }
    public Guid? CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public Subscription Subscription { get; private set; } = null!;
    public User? CreatedByUser { get; private set; }

    private ServiceLog() { }

    internal static ServiceLog Create(Guid vehicleId, Guid subscriptionId, DateOnly serviceDate, ServiceType serviceType, string? notes, Guid? createdBy)
    {
        return new ServiceLog
        {
            VehicleId = vehicleId,
            SubscriptionId = subscriptionId,
            ServiceDate = serviceDate,
            ServiceType = serviceType,
            Notes = notes,
            CreatedBy = createdBy
        };
    }

    public void UpdateNotes(string? notes)
    {
        Notes = notes;
    }
}
