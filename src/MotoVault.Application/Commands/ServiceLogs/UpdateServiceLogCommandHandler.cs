using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;
using MotoVault.Application.Interfaces.Repositories;

namespace MotoVault.Application.Commands.ServiceLogs;

public class UpdateServiceLogCommandHandler : IRequestHandler<UpdateServiceLogCommand, ServiceLogResponse>
{
    private readonly IServiceLogRepository _serviceLogRepository;
    private readonly IVehicleRepository _vehicleRepository;

    public UpdateServiceLogCommandHandler(
        IServiceLogRepository serviceLogRepository,
        IVehicleRepository vehicleRepository)
    {
        _serviceLogRepository = serviceLogRepository;
        _vehicleRepository = vehicleRepository;
    }

    public async Task<ServiceLogResponse> Handle(UpdateServiceLogCommand request, CancellationToken cancellationToken)
    {
        var log = await _serviceLogRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"ServiceLog {request.Id} not found.");

        var vehicle = await _vehicleRepository.GetByIdAsync(log.VehicleId)
            ?? throw new KeyNotFoundException($"Vehicle {log.VehicleId} not found.");

        log.UpdateNotes(request.Notes);
        await _serviceLogRepository.UpdateAsync(log);

        return new ServiceLogResponse
        {
            Id = log.Id,
            VehicleId = log.VehicleId,
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
