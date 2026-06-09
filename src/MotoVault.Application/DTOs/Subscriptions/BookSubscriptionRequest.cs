using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.Subscriptions;

public class BookSubscriptionRequest
{
    public VehicleType VehicleType { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? RegistrationNumber { get; set; }
    public Guid PackageId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}
