using MotoVault.Domain.Entities;

namespace MotoVault.Application.Interfaces.Repositories;

public interface IServiceLogRepository
{
    Task<ServiceLog?> GetByIdAsync(Guid id);
    Task<IEnumerable<ServiceLog>> GetByVehicleIdAsync(Guid vehicleId);
    Task<IEnumerable<ServiceLog>> GetBySubscriptionIdAsync(Guid subscriptionId);
    Task AddAsync(ServiceLog serviceLog);
    Task UpdateAsync(ServiceLog serviceLog);
}
