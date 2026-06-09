using MediatR;
using MotoVault.Application.DTOs.Vehicles;

namespace MotoVault.Application.Commands.Vehicles;

public record UpdateVehicleCommand(
    Guid Id,
    string? Brand,
    string? Model,
    string? RegistrationNumber
) : IRequest<VehicleResponse>;
