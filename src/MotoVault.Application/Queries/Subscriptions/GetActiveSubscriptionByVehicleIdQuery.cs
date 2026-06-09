using MediatR;
using MotoVault.Application.DTOs.Subscriptions;

namespace MotoVault.Application.Queries.Subscriptions;

public record GetActiveSubscriptionByVehicleIdQuery(Guid VehicleId) : IRequest<SubscriptionResponse?>;
