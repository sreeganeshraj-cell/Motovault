using MediatR;
using MotoVault.Application.DTOs.Subscriptions;

namespace MotoVault.Application.Commands.Subscriptions;

public record CreateSubscriptionCommand(
    Guid VehicleId,
    Guid PackageId,
    Guid SlotId,
    DateOnly StartDate,
    DateOnly? EndDate = null
) : IRequest<SubscriptionResponse>;
