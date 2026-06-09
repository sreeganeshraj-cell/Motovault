using MotoVault.Domain.Common;

namespace MotoVault.Domain.Entities;

public class Package : AggregateRoot
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal? Price { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private Package() { }

    public static Package Create(string name, string? description, decimal? price)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Package name cannot be empty.");

        return new Package
        {
            Name = name.Trim(),
            Description = description,
            Price = price
        };
    }

    public void Update(string name, string? description, decimal? price)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Package name cannot be empty.");

        Name = name.Trim();
        Description = description;
        Price = price;
    }

    public void Retire() => IsActive = false;

    public void Reactivate() => IsActive = true;
}
