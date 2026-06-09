using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;

namespace MotoVault.Application.Queries.ServiceLogs;

public record GetServiceLogByIdQuery(Guid Id) : IRequest<ServiceLogResponse?>;
