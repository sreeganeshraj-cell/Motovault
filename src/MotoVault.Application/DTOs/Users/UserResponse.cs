using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.Users;

public class UserResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public Role Role { get; set; }
    public DateTime CreatedAt { get; set; }
}
