using MediatR;

namespace MotoVault.Application.Commands.Packages;

public record RetirePackageCommand(Guid Id) : IRequest<Unit>;
