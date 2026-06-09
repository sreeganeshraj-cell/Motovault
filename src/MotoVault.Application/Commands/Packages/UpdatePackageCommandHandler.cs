using MediatR;
using MotoVault.Application.DTOs.Packages;
using MotoVault.Application.Interfaces.Repositories;

namespace MotoVault.Application.Commands.Packages;

public class UpdatePackageCommandHandler : IRequestHandler<UpdatePackageCommand, PackageResponse>
{
    private readonly IPackageRepository _packageRepository;

    public UpdatePackageCommandHandler(IPackageRepository packageRepository)
    {
        _packageRepository = packageRepository;
    }

    public async Task<PackageResponse> Handle(UpdatePackageCommand request, CancellationToken cancellationToken)
    {
        var package = await _packageRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Package {request.Id} not found.");

        package.Update(request.Name, request.Description, request.Price);

        await _packageRepository.UpdateAsync(package);

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
