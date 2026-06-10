using MotoVault.Domain.Entities;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Interfaces.Repositories;

public interface IStorageSlotRepository
{
    Task<StorageSlot?> GetByIdAsync(Guid id);
    Task<IEnumerable<StorageSlot>> GetAllAsync();
    Task<IEnumerable<StorageSlot>> GetAvailableByTypeAsync(VehicleType type);
    Task<int> CountByTypeAsync(VehicleType type);
    Task AddAsync(StorageSlot slot);
    Task UpdateAsync(StorageSlot slot);
}
