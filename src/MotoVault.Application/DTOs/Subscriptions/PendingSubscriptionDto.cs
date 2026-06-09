namespace MotoVault.Application.DTOs.Subscriptions;

public class PendingSubscriptionDto
{
    public Guid Id { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? RegistrationNumber { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
