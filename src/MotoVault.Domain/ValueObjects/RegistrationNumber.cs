namespace MotoVault.Domain.ValueObjects;

public record RegistrationNumber
{
    public string Value { get; }

    public RegistrationNumber(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Registration number cannot be empty.");

        Value = value.Trim().ToUpper();
    }

    public override string ToString() => Value;
}
