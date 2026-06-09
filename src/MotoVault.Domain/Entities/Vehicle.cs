using MotoVault.Domain.Common;
using MotoVault.Domain.Enums;
using MotoVault.Domain.ValueObjects;

namespace MotoVault.Domain.Entities;

public class Vehicle : AggregateRoot
{
    public Guid OwnerId { get; private set; }
    public VehicleType Type { get; private set; }
    public string? Brand { get; private set; }
    public string? Model { get; private set; }
    public RegistrationNumber? RegistrationNumber { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public User Owner { get; private set; } = null!;

    private readonly List<Subscription> _subscriptions = new();
    private readonly List<ServiceLog> _serviceLogs = new();

    public IReadOnlyCollection<Subscription> Subscriptions => _subscriptions.AsReadOnly();
    public IReadOnlyCollection<ServiceLog> ServiceLogs => _serviceLogs.AsReadOnly();

    private Vehicle() { }

    public static Vehicle Create(Guid ownerId, VehicleType type, string? brand, string? model, RegistrationNumber? registrationNumber)
    {
        return new Vehicle
        {
            OwnerId = ownerId,
            Type = type,
            Brand = brand,
            Model = model,
            RegistrationNumber = registrationNumber
        };
    }

    public void UpdateDetails(string? brand, string? model, RegistrationNumber? registrationNumber)
    {
        Brand = brand;
        Model = model;
        RegistrationNumber = registrationNumber;
    }

    public Subscription AddSubscription(Guid packageId, Guid slotId, DateOnly startDate, DateOnly? endDate = null)
    {
        if (_subscriptions.Any(s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Requested))
            throw new InvalidOperationException("Vehicle already has an active or pending subscription.");

        var subscription = Subscription.Create(Id, packageId, slotId, startDate, endDate);
        _subscriptions.Add(subscription);
        return subscription;
    }

    public Subscription RequestSubscription(Guid packageId, Guid slotId, DateOnly startDate, DateOnly? endDate = null)
    {
        if (_subscriptions.Any(s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Requested))
            throw new InvalidOperationException("Vehicle already has an active or pending subscription.");

        var subscription = Subscription.Create(Id, packageId, slotId, startDate, endDate, SubscriptionStatus.Requested);
        _subscriptions.Add(subscription);
        return subscription;
    }

    public ServiceLog AddServiceLog(Guid subscriptionId, DateOnly serviceDate, ServiceType serviceType, string? notes, Guid? createdBy)
    {
        var activeSubscription = _subscriptions.FirstOrDefault(s => s.Id == subscriptionId && s.Status == SubscriptionStatus.Active);

        if (activeSubscription is null)
            throw new InvalidOperationException("No active subscription found for this vehicle.");

        var log = ServiceLog.Create(Id, subscriptionId, serviceDate, serviceType, notes, createdBy);
        _serviceLogs.Add(log);
        return log;
    }
}
