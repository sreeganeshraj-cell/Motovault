using MotoVault.Domain.Entities;

namespace MotoVault.Application.Interfaces.Repositories;

public interface IServiceMediaRepository
{
    Task<ServiceMedia?> GetByIdAsync(Guid id);
    Task<IEnumerable<ServiceMedia>> GetByServiceLogIdAsync(Guid serviceLogId);
    Task AddAsync(ServiceMedia media);
    Task DeleteAsync(Guid id);
}
