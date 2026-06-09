using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;

namespace MotoVault.Application.Queries.ServiceLogs;

public record GetAllServiceLogsQuery : IRequest<IEnumerable<ServiceLogResponse>>;
