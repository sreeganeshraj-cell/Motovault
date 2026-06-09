using MediatR;
using MotoVault.Application.DTOs.Subscriptions;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.Subscriptions;

public class CreateSubscriptionCommandHandler : IRequestHandler<CreateSubscriptionCommand, SubscriptionResponse>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IStorageSlotRepository _slotRepository;
    private readonly IPackageRepository _packageRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;

    public CreateSubscriptionCommandHandler(
        IVehicleRepository vehicleRepository,
        IStorageSlotRepository slotRepository,
        IPackageRepository packageRepository,
        ISubscriptionRepository subscriptionRepository)
    {
        _vehicleRepository = vehicleRepository;
        _slotRepository = slotRepository;
        _packageRepository = packageRepository;
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task<SubscriptionResponse> Handle(CreateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.VehicleId)
            ?? throw new KeyNotFoundException($"Vehicle {request.VehicleId} not found.");

        var slot = await _slotRepository.GetByIdAsync(request.SlotId)
            ?? throw new KeyNotFoundException($"StorageSlot {request.SlotId} not found.");

        var package = await _packageRepository.GetByIdAsync(request.PackageId)
            ?? throw new KeyNotFoundException($"Package {request.PackageId} not found.");

        if (slot.Status == SlotStatus.Occupied)
            throw new InvalidOperationException($"Slot {slot.SlotNumber} is already occupied.");

        if (slot.Type != vehicle.Type)
            throw new InvalidOperationException($"Slot type '{slot.Type}' does not match vehicle type '{vehicle.Type}'.");

        if (!package.IsActive)
            throw new InvalidOperationException($"Package '{package.Name}' is no longer active.");

        var subscription = vehicle.AddSubscription(request.PackageId, request.SlotId, request.StartDate, request.EndDate);

        slot.MarkOccupied();

        // Save subscription directly (INSERT) instead of via vehicle graph update.
        // EF Core treats entities discovered through navigation collections with non-default GUIDs
        // as Modified rather than Added, causing UPDATE on a non-existent row.
        await _subscriptionRepository.AddAsync(subscription);
        await _slotRepository.UpdateAsync(slot);

        return new SubscriptionResponse
        {
            Id = subscription.Id,
            VehicleId = vehicle.Id,
            VehicleRegistrationNumber = vehicle.RegistrationNumber?.Value ?? string.Empty,
            PackageId = package.Id,
            PackageName = package.Name,
            SlotId = slot.Id,
            SlotNumber = slot.SlotNumber,
            StartDate = subscription.Period.Start,
            EndDate = subscription.Period.End,
            Status = subscription.Status,
            CreatedAt = subscription.CreatedAt
        };
    }
}
