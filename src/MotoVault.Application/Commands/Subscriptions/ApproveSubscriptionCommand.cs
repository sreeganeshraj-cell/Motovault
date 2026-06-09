using MediatR;

namespace MotoVault.Application.Commands.Subscriptions;

public record ApproveSubscriptionCommand(Guid SubscriptionId) : IRequest;
