using MediatR;
using MotoVault.Application.DTOs.Vehicles;

namespace MotoVault.Application.Queries.Vehicles;

public record GetAllVehiclesQuery : IRequest<IEnumerable<VehicleResponse>>;
