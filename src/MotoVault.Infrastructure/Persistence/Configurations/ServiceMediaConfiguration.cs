using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence.Configurations;

public class ServiceMediaConfiguration : IEntityTypeConfiguration<ServiceMedia>
{
    public void Configure(EntityTypeBuilder<ServiceMedia> builder)
    {
        builder.ToTable("ServiceMedia");

        builder.HasKey(sm => sm.Id);

        builder.Property(sm => sm.FileUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(sm => sm.MediaType)
            .HasConversion<string>();

        builder.HasOne(sm => sm.ServiceLog)
            .WithMany()
            .HasForeignKey(sm => sm.ServiceLogId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(sm => sm.CreatedAt)
            .IsRequired();
    }
}
