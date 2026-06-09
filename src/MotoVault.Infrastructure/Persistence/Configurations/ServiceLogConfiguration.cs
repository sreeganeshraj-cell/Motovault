using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence.Configurations;

public class ServiceLogConfiguration : IEntityTypeConfiguration<ServiceLog>
{
    public void Configure(EntityTypeBuilder<ServiceLog> builder)
    {
        builder.ToTable("ServiceLogs");

        builder.HasKey(sl => sl.Id);

        builder.Property(sl => sl.ServiceDate)
            .IsRequired();

        builder.Property(sl => sl.ServiceType)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(sl => sl.Notes)
            .HasMaxLength(1000);

        builder.HasOne(sl => sl.Subscription)
            .WithMany()
            .HasForeignKey(sl => sl.SubscriptionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sl => sl.CreatedByUser)
            .WithMany()
            .HasForeignKey(sl => sl.CreatedBy)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(sl => sl.CreatedAt)
            .IsRequired();
    }
}
