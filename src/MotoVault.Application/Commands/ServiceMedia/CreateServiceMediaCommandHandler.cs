using MediatR;
using MotoVault.Application.DTOs.ServiceMedia;
using MotoVault.Application.Interfaces.Repositories;
using ServiceMediaEntity = MotoVault.Domain.Entities.ServiceMedia;

namespace MotoVault.Application.Commands.ServiceMedia;

public class CreateServiceMediaCommandHandler : IRequestHandler<CreateServiceMediaCommand, ServiceMediaResponse>
{
    private readonly IServiceLogRepository _serviceLogRepository;
    private readonly IServiceMediaRepository _serviceMediaRepository;

    public CreateServiceMediaCommandHandler(
        IServiceLogRepository serviceLogRepository,
        IServiceMediaRepository serviceMediaRepository)
    {
        _serviceLogRepository = serviceLogRepository;
        _serviceMediaRepository = serviceMediaRepository;
    }

    public async Task<ServiceMediaResponse> Handle(CreateServiceMediaCommand request, CancellationToken cancellationToken)
    {
        var log = await _serviceLogRepository.GetByIdAsync(request.ServiceLogId)
            ?? throw new KeyNotFoundException($"ServiceLog {request.ServiceLogId} not found.");

        var media = ServiceMediaEntity.Create(log.Id, request.FileUrl, request.MediaType);
        await _serviceMediaRepository.AddAsync(media);

        return new ServiceMediaResponse
        {
            Id = media.Id,
            ServiceLogId = media.ServiceLogId,
            FileUrl = media.FileUrl,
            MediaType = media.MediaType,
            CreatedAt = media.CreatedAt
        };
    }
}
