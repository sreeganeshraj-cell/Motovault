using MediatR;
using MotoVault.Application.DTOs.ServiceMedia;

namespace MotoVault.Application.Queries.ServiceMedia;

public record GetServiceMediaByIdQuery(Guid Id) : IRequest<ServiceMediaResponse?>;
