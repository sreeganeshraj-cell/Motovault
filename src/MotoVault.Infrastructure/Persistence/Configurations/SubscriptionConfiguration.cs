using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("Subscriptions");

        builder.HasKey(s => s.Id);

        builder.OwnsOne(s => s.Period, period =>
        {
            period.Property(p => p.Start)
                .HasColumnName("StartDate")
                .IsRequired();

            period.Property(p => p.End)
                .HasColumnName("EndDate");
        });

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .IsRequired();

        builder.HasOne(s => s.Package)
            .WithMany()
            .HasForeignKey(s => s.PackageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Slot)
            .WithMany()
            .HasForeignKey(s => s.SlotId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(s => s.CreatedAt)
            .IsRequired();
    }
}
