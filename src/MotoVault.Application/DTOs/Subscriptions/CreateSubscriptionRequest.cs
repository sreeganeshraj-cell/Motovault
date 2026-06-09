namespace MotoVault.Application.DTOs.Subscriptions;

public class CreateSubscriptionRequest
{
    public Guid VehicleId { get; set; }
    public Guid PackageId { get; set; }
    public Guid SlotId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}
