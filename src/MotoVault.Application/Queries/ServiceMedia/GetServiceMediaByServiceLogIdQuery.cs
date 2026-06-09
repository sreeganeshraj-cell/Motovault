using MediatR;
using MotoVault.Application.DTOs.ServiceMedia;

namespace MotoVault.Application.Queries.ServiceMedia;

public record GetServiceMediaByServiceLogIdQuery(Guid ServiceLogId) : IRequest<IEnumerable<ServiceMediaResponse>>;
