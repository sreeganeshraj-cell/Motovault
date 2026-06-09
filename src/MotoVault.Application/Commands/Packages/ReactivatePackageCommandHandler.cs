using MediatR;
using MotoVault.Application.Interfaces.Repositories;

namespace MotoVault.Application.Commands.Packages;

public class ReactivatePackageCommandHandler : IRequestHandler<ReactivatePackageCommand, Unit>
{
    private readonly IPackageRepository _packageRepository;

    public ReactivatePackageCommandHandler(IPackageRepository packageRepository)
    {
        _packageRepository = packageRepository;
    }

    public async Task<Unit> Handle(ReactivatePackageCommand request, CancellationToken cancellationToken)
    {
        var package = await _packageRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Package {request.Id} not found.");

        package.Reactivate();

        await _packageRepository.UpdateAsync(package);

        return Unit.Value;
    }
}
