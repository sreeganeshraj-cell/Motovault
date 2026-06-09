using Microsoft.EntityFrameworkCore;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;
using MotoVault.Domain.Enums;

namespace MotoVault.Infrastructure.Persistence.Repositories;

public class StorageSlotRepository : IStorageSlotRepository
{
    private readonly AppDbContext _context;

    public StorageSlotRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<StorageSlot?> GetByIdAsync(Guid id)
    {
        return await _context.StorageSlots
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<StorageSlot>> GetAllAsync()
    {
        return await _context.StorageSlots
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<StorageSlot>> GetAvailableByTypeAsync(VehicleType type)
    {
        return await _context.StorageSlots
            .AsNoTracking()
            .Where(s => s.Type == type && s.Status == SlotStatus.Available)
            .ToListAsync();
    }

    public async Task AddAsync(StorageSlot slot)
    {
        await _context.StorageSlots.AddAsync(slot);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(StorageSlot slot)
    {
        if (_context.Entry(slot).State == Microsoft.EntityFrameworkCore.EntityState.Detached)
            _context.StorageSlots.Update(slot);
        await _context.SaveChangesAsync();
    }
}
