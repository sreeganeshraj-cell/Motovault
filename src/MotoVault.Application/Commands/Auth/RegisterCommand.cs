using MediatR;
using MotoVault.Application.DTOs.Auth;

namespace MotoVault.Application.Commands.Auth;

public record RegisterCommand(
    string Name,
    string Email,
    string? Phone,
    string Password
) : IRequest<AuthResponse>;
