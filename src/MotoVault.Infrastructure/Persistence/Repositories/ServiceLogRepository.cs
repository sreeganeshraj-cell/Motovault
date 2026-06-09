using Microsoft.EntityFrameworkCore;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence.Repositories;

public class ServiceLogRepository : IServiceLogRepository
{
    private readonly AppDbContext _context;

    public ServiceLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceLog?> GetByIdAsync(Guid id)
    {
        return await _context.ServiceLogs
            .FirstOrDefaultAsync(sl => sl.Id == id);
    }

    public async Task<IEnumerable<ServiceLog>> GetByVehicleIdAsync(Guid vehicleId)
    {
        return await _context.ServiceLogs
            .AsNoTracking()
            .Where(sl => sl.VehicleId == vehicleId)
            .OrderByDescending(sl => sl.ServiceDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<ServiceLog>> GetBySubscriptionIdAsync(Guid subscriptionId)
    {
        return await _context.ServiceLogs
            .AsNoTracking()
            .Where(sl => sl.SubscriptionId == subscriptionId)
            .OrderByDescending(sl => sl.ServiceDate)
            .ToListAsync();
    }

    public async Task AddAsync(ServiceLog serviceLog)
    {
        await _context.ServiceLogs.AddAsync(serviceLog);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(ServiceLog serviceLog)
    {
        _context.ServiceLogs.Update(serviceLog);
        await _context.SaveChangesAsync();
    }
}
