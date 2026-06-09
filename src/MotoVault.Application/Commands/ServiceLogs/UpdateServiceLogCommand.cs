using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;

namespace MotoVault.Application.Commands.ServiceLogs;

public record UpdateServiceLogCommand(
    Guid Id,
    string? Notes
) : IRequest<ServiceLogResponse>;
