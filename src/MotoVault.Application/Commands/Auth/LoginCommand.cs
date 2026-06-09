using MediatR;
using MotoVault.Application.DTOs.Auth;

namespace MotoVault.Application.Commands.Auth;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponse>;
