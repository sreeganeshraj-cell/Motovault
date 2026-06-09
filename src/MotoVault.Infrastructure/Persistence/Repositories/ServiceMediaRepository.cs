using Microsoft.EntityFrameworkCore;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence.Repositories;

public class ServiceMediaRepository : IServiceMediaRepository
{
    private readonly AppDbContext _context;

    public ServiceMediaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceMedia?> GetByIdAsync(Guid id)
    {
        return await _context.ServiceMedia
            .FirstOrDefaultAsync(sm => sm.Id == id);
    }

    public async Task<IEnumerable<ServiceMedia>> GetByServiceLogIdAsync(Guid serviceLogId)
    {
        return await _context.ServiceMedia
            .AsNoTracking()
            .Where(sm => sm.ServiceLogId == serviceLogId)
            .OrderBy(sm => sm.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(ServiceMedia media)
    {
        await _context.ServiceMedia.AddAsync(media);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var media = await _context.ServiceMedia.FindAsync(id);
        if (media is not null)
        {
            _context.ServiceMedia.Remove(media);
            await _context.SaveChangesAsync();
        }
    }
}
