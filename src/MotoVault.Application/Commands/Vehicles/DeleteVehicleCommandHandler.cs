using MediatR;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.Vehicles;

public class DeleteVehicleCommandHandler : IRequestHandler<DeleteVehicleCommand, Unit>
{
    private readonly IVehicleRepository _vehicleRepository;

    public DeleteVehicleCommandHandler(IVehicleRepository vehicleRepository)
    {
        _vehicleRepository = vehicleRepository;
    }

    public async Task<Unit> Handle(DeleteVehicleCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Vehicle {request.Id} not found.");

        if (vehicle.Subscriptions.Any(s => s.Status == SubscriptionStatus.Active))
            throw new InvalidOperationException("Cannot delete a vehicle with an active subscription.");

        await _vehicleRepository.DeleteAsync(vehicle.Id);

        return Unit.Value;
    }
}
