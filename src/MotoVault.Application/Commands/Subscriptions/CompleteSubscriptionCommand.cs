using MediatR;

namespace MotoVault.Application.Commands.Subscriptions;

public record CompleteSubscriptionCommand(Guid SubscriptionId, DateOnly EndDate) : IRequest<Unit>;
