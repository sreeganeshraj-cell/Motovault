using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("Vehicles");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.Type)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(v => v.Brand)
            .HasMaxLength(100);

        builder.Property(v => v.Model)
            .HasMaxLength(100);

        builder.OwnsOne(v => v.RegistrationNumber, rn =>
        {
            rn.Property(r => r.Value)
                .HasColumnName("RegistrationNumber")
                .HasMaxLength(20);
        });

        builder.HasOne(v => v.Owner)
            .WithMany()
            .HasForeignKey(v => v.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(v => v.Subscriptions)
            .WithOne()
            .HasForeignKey(s => s.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(v => v.Subscriptions)
            .HasField("_subscriptions")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(v => v.ServiceLogs)
            .WithOne()
            .HasForeignKey(sl => sl.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(v => v.ServiceLogs)
            .HasField("_serviceLogs")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Property(v => v.CreatedAt)
            .IsRequired();
    }
}
