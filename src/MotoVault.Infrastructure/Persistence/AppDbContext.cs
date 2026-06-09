using Microsoft.EntityFrameworkCore;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<StorageSlot> StorageSlots => Set<StorageSlot>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<ServiceLog> ServiceLogs => Set<ServiceLog>();
    public DbSet<ServiceMedia> ServiceMedia => Set<ServiceMedia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
