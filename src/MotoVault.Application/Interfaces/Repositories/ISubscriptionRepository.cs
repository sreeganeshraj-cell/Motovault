using MotoVault.Domain.Entities;

namespace MotoVault.Application.Interfaces.Repositories;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByIdAsync(Guid id);
    Task<IEnumerable<Subscription>> GetAllAsync();
    Task<IEnumerable<Subscription>> GetByVehicleIdAsync(Guid vehicleId);
    Task<Subscription?> GetActiveByVehicleIdAsync(Guid vehicleId);
    Task AddAsync(Subscription subscription);
    Task UpdateAsync(Subscription subscription);
}
