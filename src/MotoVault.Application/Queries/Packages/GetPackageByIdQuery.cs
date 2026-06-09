using MediatR;
using MotoVault.Application.DTOs.Packages;

namespace MotoVault.Application.Queries.Packages;

public record GetPackageByIdQuery(Guid Id) : IRequest<PackageResponse?>;
