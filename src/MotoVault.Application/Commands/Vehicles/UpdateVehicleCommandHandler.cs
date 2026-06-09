using MediatR;
using MotoVault.Application.DTOs.Vehicles;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.ValueObjects;

namespace MotoVault.Application.Commands.Vehicles;

public class UpdateVehicleCommandHandler : IRequestHandler<UpdateVehicleCommand, VehicleResponse>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IUserRepository _userRepository;

    public UpdateVehicleCommandHandler(IVehicleRepository vehicleRepository, IUserRepository userRepository)
    {
        _vehicleRepository = vehicleRepository;
        _userRepository = userRepository;
    }

    public async Task<VehicleResponse> Handle(UpdateVehicleCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Vehicle {request.Id} not found.");

        var owner = await _userRepository.GetByIdAsync(vehicle.OwnerId)
            ?? throw new KeyNotFoundException($"User {vehicle.OwnerId} not found.");

        var registrationNumber = request.RegistrationNumber is not null
            ? new RegistrationNumber(request.RegistrationNumber)
            : null;

        vehicle.UpdateDetails(request.Brand, request.Model, registrationNumber);

        await _vehicleRepository.UpdateAsync(vehicle);

        return new VehicleResponse
        {
            Id = vehicle.Id,
            OwnerId = vehicle.OwnerId,
            OwnerName = owner.Name,
            Type = vehicle.Type,
            Brand = vehicle.Brand,
            Model = vehicle.Model,
            RegistrationNumber = vehicle.RegistrationNumber?.Value,
            CreatedAt = vehicle.CreatedAt
        };
    }
}
