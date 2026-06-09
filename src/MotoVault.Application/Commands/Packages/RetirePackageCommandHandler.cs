using MediatR;
using MotoVault.Application.Interfaces.Repositories;

namespace MotoVault.Application.Commands.Packages;

public class RetirePackageCommandHandler : IRequestHandler<RetirePackageCommand, Unit>
{
    private readonly IPackageRepository _packageRepository;

    public RetirePackageCommandHandler(IPackageRepository packageRepository)
    {
        _packageRepository = packageRepository;
    }

    public async Task<Unit> Handle(RetirePackageCommand request, CancellationToken cancellationToken)
    {
        var package = await _packageRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"Package {request.Id} not found.");

        package.Retire();

        await _packageRepository.UpdateAsync(package);

        return Unit.Value;
    }
}
