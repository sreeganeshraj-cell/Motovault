using MediatR;
using MotoVault.Application.DTOs.Vehicles;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;
using MotoVault.Domain.ValueObjects;

namespace MotoVault.Application.Commands.Vehicles;

public class CreateVehicleCommandHandler : IRequestHandler<CreateVehicleCommand, VehicleResponse>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IUserRepository _userRepository;

    public CreateVehicleCommandHandler(IVehicleRepository vehicleRepository, IUserRepository userRepository)
    {
        _vehicleRepository = vehicleRepository;
        _userRepository = userRepository;
    }

    public async Task<VehicleResponse> Handle(CreateVehicleCommand request, CancellationToken cancellationToken)
    {
        var owner = await _userRepository.GetByIdAsync(request.OwnerId)
            ?? throw new KeyNotFoundException($"User {request.OwnerId} not found.");

        var registrationNumber = request.RegistrationNumber is not null
            ? new RegistrationNumber(request.RegistrationNumber)
            : null;

        var vehicle = Vehicle.Create(request.OwnerId, request.Type, request.Brand, request.Model, registrationNumber);

        await _vehicleRepository.AddAsync(vehicle);

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
