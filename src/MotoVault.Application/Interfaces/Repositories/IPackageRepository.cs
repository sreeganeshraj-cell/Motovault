using MotoVault.Domain.Entities;

namespace MotoVault.Application.Interfaces.Repositories;

public interface IPackageRepository
{
    Task<Package?> GetByIdAsync(Guid id);
    Task<IEnumerable<Package>> GetAllAsync();
    Task AddAsync(Package package);
    Task UpdateAsync(Package package);
}
