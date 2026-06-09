using MediatR;
using MotoVault.Application.DTOs.ServiceMedia;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.ServiceMedia;

public record CreateServiceMediaCommand(
    Guid ServiceLogId,
    string FileUrl,
    MediaType? MediaType
) : IRequest<ServiceMediaResponse>;
