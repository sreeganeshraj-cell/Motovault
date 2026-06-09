using MediatR;
using MotoVault.Application.DTOs.Packages;

namespace MotoVault.Application.Queries.Packages;

public record GetAllPackagesQuery(bool ActiveOnly = true) : IRequest<IEnumerable<PackageResponse>>;
