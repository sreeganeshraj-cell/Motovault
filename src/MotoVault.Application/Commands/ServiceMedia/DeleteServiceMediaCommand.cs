using MediatR;

namespace MotoVault.Application.Commands.ServiceMedia;

public record DeleteServiceMediaCommand(Guid Id) : IRequest;
