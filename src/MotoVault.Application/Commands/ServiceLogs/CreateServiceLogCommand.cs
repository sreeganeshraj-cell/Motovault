using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.ServiceLogs;

public record CreateServiceLogCommand(
    Guid VehicleId,
    Guid SubscriptionId,
    DateOnly ServiceDate,
    ServiceType ServiceType,
    string? Notes,
    Guid? CreatedBy
) : IRequest<ServiceLogResponse>;
