using MediatR;

namespace MotoVault.Application.Commands.Packages;

public record ReactivatePackageCommand(Guid Id) : IRequest<Unit>;
