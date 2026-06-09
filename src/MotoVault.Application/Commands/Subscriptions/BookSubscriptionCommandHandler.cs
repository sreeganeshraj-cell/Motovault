using MediatR;
using MotoVault.Application.DTOs.Subscriptions;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;
using MotoVault.Domain.ValueObjects;

namespace MotoVault.Application.Commands.Subscriptions;

public class BookSubscriptionCommandHandler : IRequestHandler<BookSubscriptionCommand, SubscriptionResponse>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IStorageSlotRepository _slotRepository;
    private readonly IPackageRepository _packageRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;

    public BookSubscriptionCommandHandler(
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

    public async Task<SubscriptionResponse> Handle(BookSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var package = await _packageRepository.GetByIdAsync(request.PackageId)
            ?? throw new KeyNotFoundException($"Package {request.PackageId} not found.");

        if (!package.IsActive)
            throw new InvalidOperationException($"Package '{package.Name}' is no longer active.");

        var availableSlots = await _slotRepository.GetAvailableByTypeAsync(request.VehicleType);
        var slot = availableSlots.FirstOrDefault()
            ?? throw new InvalidOperationException($"No {request.VehicleType} slots are currently available. Please contact us to join the waitlist.");

        RegistrationNumber? regNum = string.IsNullOrWhiteSpace(request.RegistrationNumber)
            ? null
            : new RegistrationNumber(request.RegistrationNumber);

        var vehicle = Vehicle.Create(request.OwnerId, request.VehicleType, request.Brand, request.Model, regNum);
        await _vehicleRepository.AddAsync(vehicle);

        var subscription = vehicle.RequestSubscription(request.PackageId, slot.Id, request.StartDate, request.EndDate);

        slot.MarkOccupied();
        await _subscriptionRepository.AddAsync(subscription);
        await _slotRepository.UpdateAsync(slot);

        return new SubscriptionResponse
        {
            Id = subscription.Id,
            VehicleId = vehicle.Id,
            VehicleRegistrationNumber = vehicle.RegistrationNumber?.Value ?? string.Empty,
            VehicleType = vehicle.Type.ToString(),
            OwnerName = request.OwnerName,
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
