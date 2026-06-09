using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;
using MotoVault.Application.Interfaces.Repositories;

namespace MotoVault.Application.Commands.ServiceLogs;

public class CreateServiceLogCommandHandler : IRequestHandler<CreateServiceLogCommand, ServiceLogResponse>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IServiceLogRepository _serviceLogRepository;

    public CreateServiceLogCommandHandler(IVehicleRepository vehicleRepository, IServiceLogRepository serviceLogRepository)
    {
        _vehicleRepository = vehicleRepository;
        _serviceLogRepository = serviceLogRepository;
    }

    public async Task<ServiceLogResponse> Handle(CreateServiceLogCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.VehicleId)
            ?? throw new KeyNotFoundException($"Vehicle {request.VehicleId} not found.");

        var log = vehicle.AddServiceLog(
            request.SubscriptionId,
            request.ServiceDate,
            request.ServiceType,
            request.Notes,
            request.CreatedBy);

        await _serviceLogRepository.AddAsync(log);

        return new ServiceLogResponse
        {
            Id = log.Id,
            VehicleId = vehicle.Id,
            VehicleRegistrationNumber = vehicle.RegistrationNumber?.Value ?? string.Empty,
            SubscriptionId = log.SubscriptionId,
            ServiceDate = log.ServiceDate,
            ServiceType = log.ServiceType,
            Notes = log.Notes,
            CreatedBy = log.CreatedBy,
            CreatedAt = log.CreatedAt,
            MediaCount = 0
        };
    }
}
