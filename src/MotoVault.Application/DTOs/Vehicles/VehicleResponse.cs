using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.Vehicles;

public class VehicleResponse
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? RegistrationNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}
