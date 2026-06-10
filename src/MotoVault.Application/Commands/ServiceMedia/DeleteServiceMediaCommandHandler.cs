using MediatR;
using MotoVault.Application.Interfaces;
using MotoVault.Application.Interfaces.Repositories;

namespace MotoVault.Application.Commands.ServiceMedia;

public class DeleteServiceMediaCommandHandler : IRequestHandler<DeleteServiceMediaCommand>
{
    private readonly IServiceMediaRepository _serviceMediaRepository;
    private readonly IFileService _fileService;

    public DeleteServiceMediaCommandHandler(
        IServiceMediaRepository serviceMediaRepository,
        IFileService fileService)
    {
        _serviceMediaRepository = serviceMediaRepository;
        _fileService = fileService;
    }

    public async Task Handle(DeleteServiceMediaCommand request, CancellationToken cancellationToken)
    {
        var media = await _serviceMediaRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"ServiceMedia {request.Id} not found.");

        try
        {
            _fileService.DeleteFile(media.FileUrl);
        }
        catch
        {
            // File deletion is best-effort; DB record is always removed
        }

        await _serviceMediaRepository.DeleteAsync(media.Id);
    }
}
