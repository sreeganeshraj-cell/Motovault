using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.Subscriptions;

public class SubscriptionResponse
{
    public Guid Id { get; set; }

    public Guid VehicleId { get; set; }
    public string VehicleRegistrationNumber { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;

    public string OwnerName { get; set; } = string.Empty;

    public Guid PackageId { get; set; }
    public string PackageName { get; set; } = string.Empty;

    public Guid SlotId { get; set; }
    public int SlotNumber { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
