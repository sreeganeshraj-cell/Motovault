using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.Vehicles;

public class CreateVehicleRequest
{
    public Guid OwnerId { get; set; }
    public VehicleType Type { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? RegistrationNumber { get; set; }
}
