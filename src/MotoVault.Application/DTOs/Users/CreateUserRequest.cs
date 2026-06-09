using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.Users;

public class CreateUserRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public Role Role { get; set; }
    public string Password { get; set; } = string.Empty;
}
