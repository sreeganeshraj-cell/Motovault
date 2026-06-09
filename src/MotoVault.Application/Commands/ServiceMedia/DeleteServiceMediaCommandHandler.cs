using MediatR;
using MotoVault.Application.Interfaces.Repositories;

namespace MotoVault.Application.Commands.ServiceMedia;

public class DeleteServiceMediaCommandHandler : IRequestHandler<DeleteServiceMediaCommand>
{
    private readonly IServiceMediaRepository _serviceMediaRepository;

    public DeleteServiceMediaCommandHandler(IServiceMediaRepository serviceMediaRepository)
    {
        _serviceMediaRepository = serviceMediaRepository;
    }

    public async Task Handle(DeleteServiceMediaCommand request, CancellationToken cancellationToken)
    {
        var media = await _serviceMediaRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"ServiceMedia {request.Id} not found.");

        await _serviceMediaRepository.DeleteAsync(media.Id);
    }
}
