using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence.Configurations;

public class StorageSlotConfiguration : IEntityTypeConfiguration<StorageSlot>
{
    public void Configure(EntityTypeBuilder<StorageSlot> builder)
    {
        builder.ToTable("StorageSlots");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.SlotNumber)
            .IsRequired();

        builder.Property(s => s.Type)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.HasIndex(s => new { s.SlotNumber, s.Type })
            .IsUnique();
    }
}
