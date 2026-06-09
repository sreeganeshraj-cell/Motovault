using MediatR;
using MotoVault.Application.DTOs.Packages;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;

namespace MotoVault.Application.Commands.Packages;

public class CreatePackageCommandHandler : IRequestHandler<CreatePackageCommand, PackageResponse>
{
    private readonly IPackageRepository _packageRepository;

    public CreatePackageCommandHandler(IPackageRepository packageRepository)
    {
        _packageRepository = packageRepository;
    }

    public async Task<PackageResponse> Handle(CreatePackageCommand request, CancellationToken cancellationToken)
    {
        var package = Package.Create(request.Name, request.Description, request.Price);

        await _packageRepository.AddAsync(package);

        return new PackageResponse
        {
            Id = package.Id,
            Name = package.Name,
            Description = package.Description,
            Price = package.Price,
            IsActive = package.IsActive,
            CreatedAt = package.CreatedAt
        };
    }
}
