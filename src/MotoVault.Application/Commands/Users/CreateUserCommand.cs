using MediatR;
using MotoVault.Application.DTOs.Users;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.Users;

public record CreateUserCommand(
    string Name,
    string? Phone,
    string? Email,
    Role Role,
    string Password
) : IRequest<UserResponse>;
