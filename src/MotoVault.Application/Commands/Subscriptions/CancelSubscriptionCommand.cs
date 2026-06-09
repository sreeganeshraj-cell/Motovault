using MediatR;

namespace MotoVault.Application.Commands.Subscriptions;

public record CancelSubscriptionCommand(Guid SubscriptionId, DateOnly EndDate) : IRequest<Unit>;
