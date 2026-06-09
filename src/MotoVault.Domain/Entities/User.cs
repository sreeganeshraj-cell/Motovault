using MotoVault.Domain.Common;
using MotoVault.Domain.Enums;
using MotoVault.Domain.ValueObjects;

namespace MotoVault.Domain.Entities;

public class User : AggregateRoot
{
    public string Name { get; private set; } = string.Empty;
    public ContactInfo Contact { get; private set; } = null!;
    public Role Role { get; private set; }
    public string? PasswordHash { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private User() { }

    public void SetPassword(string passwordHash) => PasswordHash = passwordHash;

    public static User Create(string name, ContactInfo contact, Role role)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty.");

        return new User
        {
            Name = name.Trim(),
            Contact = contact,
            Role = role
        };
    }

    public void UpdateProfile(string name, ContactInfo contact)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty.");

        Name = name.Trim();
        Contact = contact;
    }
}
