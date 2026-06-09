using MediatR;
using MotoVault.Application.DTOs.Vehicles;

namespace MotoVault.Application.Queries.Vehicles;

public record GetVehiclesByOwnerIdQuery(Guid OwnerId) : IRequest<IEnumerable<VehicleResponse>>;
