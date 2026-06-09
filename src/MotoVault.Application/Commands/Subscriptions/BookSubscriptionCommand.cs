using MediatR;
using MotoVault.Application.DTOs.Subscriptions;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.Subscriptions;

public record BookSubscriptionCommand(
    Guid OwnerId,
    string OwnerName,
    VehicleType VehicleType,
    string? Brand,
    string? Model,
    string? RegistrationNumber,
    Guid PackageId,
    DateOnly StartDate,
    DateOnly EndDate
) : IRequest<SubscriptionResponse>;
