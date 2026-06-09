using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MotoVault.Domain.Entities;

namespace MotoVault.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Role)
            .HasConversion<string>()
            .IsRequired();

        builder.OwnsOne(u => u.Contact, contact =>
        {
            contact.Property(c => c.Phone)
                .HasColumnName("Phone")
                .HasMaxLength(20);

            contact.Property(c => c.Email)
                .HasColumnName("Email")
                .HasMaxLength(150);
        });

        builder.Property(u => u.PasswordHash)
            .HasMaxLength(100);

        builder.Property(u => u.CreatedAt)
            .IsRequired();
    }
}
