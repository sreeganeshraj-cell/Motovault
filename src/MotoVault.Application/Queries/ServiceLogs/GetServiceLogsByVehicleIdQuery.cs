using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;

namespace MotoVault.Application.Queries.ServiceLogs;

public record GetServiceLogsByVehicleIdQuery(Guid VehicleId) : IRequest<IEnumerable<ServiceLogResponse>>;
