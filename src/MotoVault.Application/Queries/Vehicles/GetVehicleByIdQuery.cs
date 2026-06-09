using MediatR;
using MotoVault.Application.DTOs.Vehicles;

namespace MotoVault.Application.Queries.Vehicles;

public record GetVehicleByIdQuery(Guid Id) : IRequest<VehicleResponse?>;
