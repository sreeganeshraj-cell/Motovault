namespace MotoVault.Domain.ValueObjects;

public record ContactInfo
{
    public string? Phone { get; }
    public string? Email { get; }

    public ContactInfo(string? phone, string? email)
    {
        if (phone is null && email is null)
            throw new ArgumentException("At least one of phone or email must be provided.");

        Phone = phone?.Trim();
        Email = email?.Trim().ToLower();
    }
}
