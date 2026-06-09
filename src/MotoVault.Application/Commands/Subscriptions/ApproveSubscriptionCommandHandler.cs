using MediatR;
using MotoVault.Application.Interfaces.Repositories;

namespace MotoVault.Application.Commands.Subscriptions;

public class ApproveSubscriptionCommandHandler : IRequestHandler<ApproveSubscriptionCommand>
{
    private readonly ISubscriptionRepository _subscriptionRepository;

    public ApproveSubscriptionCommandHandler(ISubscriptionRepository subscriptionRepository)
    {
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task Handle(ApproveSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(request.SubscriptionId)
            ?? throw new KeyNotFoundException($"Subscription {request.SubscriptionId} not found.");

        subscription.Approve();
        await _subscriptionRepository.UpdateAsync(subscription);
    }
}
