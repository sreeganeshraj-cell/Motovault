using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;

namespace MotoVault.Application.Queries.ServiceLogs;

public record GetServiceLogsBySubscriptionIdQuery(Guid SubscriptionId) : IRequest<IEnumerable<ServiceLogResponse>>;
