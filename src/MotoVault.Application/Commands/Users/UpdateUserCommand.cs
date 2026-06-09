using MediatR;
using MotoVault.Application.DTOs.Users;

namespace MotoVault.Application.Commands.Users;

public record UpdateUserCommand(
    Guid Id,
    string Name,
    string? Phone,
    string? Email
) : IRequest<UserResponse>;
