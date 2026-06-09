using MediatR;
using MotoVault.Application.DTOs.Packages;

namespace MotoVault.Application.Commands.Packages;

public record UpdatePackageCommand(
    Guid Id,
    string Name,
    string? Description,
    decimal? Price
) : IRequest<PackageResponse>;
