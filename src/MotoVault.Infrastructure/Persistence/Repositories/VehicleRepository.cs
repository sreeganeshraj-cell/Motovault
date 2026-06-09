using Microsoft.EntityFrameworkCore;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence.Repositories;

public class VehicleRepository : IVehicleRepository
{
    private readonly AppDbContext _context;

    public VehicleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Vehicle?> GetByIdAsync(Guid id)
    {
        return await _context.Vehicles
            .Include(v => v.Subscriptions)
            .Include(v => v.ServiceLogs)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<IEnumerable<Vehicle>> GetAllAsync()
    {
        return await _context.Vehicles
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Vehicle>> GetByOwnerIdAsync(Guid ownerId)
    {
        return await _context.Vehicles
            .AsNoTracking()
            .Where(v => v.OwnerId == ownerId)
            .ToListAsync();
    }

    public async Task AddAsync(Vehicle vehicle)
    {
        await _context.Vehicles.AddAsync(vehicle);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Vehicle vehicle)
    {
        if (_context.Entry(vehicle).State == Microsoft.EntityFrameworkCore.EntityState.Detached)
            _context.Vehicles.Update(vehicle);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle is not null)
        {
            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();
        }
    }
}
