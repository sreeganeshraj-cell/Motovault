using MediatR;

namespace MotoVault.Application.Commands.Users;

public record DeleteUserCommand(Guid Id) : IRequest<Unit>;
