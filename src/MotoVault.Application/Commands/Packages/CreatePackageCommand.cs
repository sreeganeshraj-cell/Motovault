using MediatR;
using MotoVault.Application.DTOs.Packages;

namespace MotoVault.Application.Commands.Packages;

public record CreatePackageCommand(
    string Name,
    string? Description,
    decimal? Price
) : IRequest<PackageResponse>;
