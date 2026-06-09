using MediatR;
using MotoVault.Application.DTOs.Subscriptions;

namespace MotoVault.Application.Queries.Subscriptions;

public record GetSubscriptionsByVehicleIdQuery(Guid VehicleId) : IRequest<IEnumerable<SubscriptionResponse>>;
