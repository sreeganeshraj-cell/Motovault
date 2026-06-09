using MediatR;
using MotoVault.Application.DTOs.Vehicles;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.Vehicles;

public record CreateVehicleCommand(
    Guid OwnerId,
    VehicleType Type,
    string? Brand,
    string? Model,
    string? RegistrationNumber
) : IRequest<VehicleResponse>;
