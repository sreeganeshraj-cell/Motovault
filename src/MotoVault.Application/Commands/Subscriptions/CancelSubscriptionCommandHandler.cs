using MediatR;
using MotoVault.Application.Interfaces.Repositories;

namespace MotoVault.Application.Commands.Subscriptions;

public class CancelSubscriptionCommandHandler : IRequestHandler<CancelSubscriptionCommand, Unit>
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IStorageSlotRepository _slotRepository;

    public CancelSubscriptionCommandHandler(
        ISubscriptionRepository subscriptionRepository,
        IVehicleRepository vehicleRepository,
        IStorageSlotRepository slotRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _vehicleRepository = vehicleRepository;
        _slotRepository = slotRepository;
    }

    public async Task<Unit> Handle(CancelSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(request.SubscriptionId)
            ?? throw new KeyNotFoundException($"Subscription {request.SubscriptionId} not found.");

        var vehicle = await _vehicleRepository.GetByIdAsync(subscription.VehicleId)
            ?? throw new KeyNotFoundException($"Vehicle {subscription.VehicleId} not found.");

        var slot = await _slotRepository.GetByIdAsync(subscription.SlotId)
            ?? throw new KeyNotFoundException($"StorageSlot {subscription.SlotId} not found.");

        var sub = vehicle.Subscriptions.First(s => s.Id == request.SubscriptionId);
        sub.Cancel(request.EndDate);

        slot.MarkAvailable();

        await _vehicleRepository.UpdateAsync(vehicle);
        await _slotRepository.UpdateAsync(slot);

        return Unit.Value;
    }
}
