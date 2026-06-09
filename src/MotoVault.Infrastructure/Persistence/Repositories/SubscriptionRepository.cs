using Microsoft.EntityFrameworkCore;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;
using MotoVault.Domain.Enums;

namespace MotoVault.Infrastructure.Persistence.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly AppDbContext _context;

    public SubscriptionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Subscription?> GetByIdAsync(Guid id)
    {
        return await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Subscription>> GetAllAsync()
    {
        return await _context.Subscriptions
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Subscription>> GetByVehicleIdAsync(Guid vehicleId)
    {
        return await _context.Subscriptions
            .AsNoTracking()
            .Where(s => s.VehicleId == vehicleId)
            .ToListAsync();
    }

    public async Task<Subscription?> GetActiveByVehicleIdAsync(Guid vehicleId)
    {
        return await _context.Subscriptions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.VehicleId == vehicleId && s.Status == SubscriptionStatus.Active);
    }

    public async Task AddAsync(Subscription subscription)
    {
        await _context.Subscriptions.AddAsync(subscription);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Subscription subscription)
    {
        _context.Subscriptions.Update(subscription);
        await _context.SaveChangesAsync();
    }
}
