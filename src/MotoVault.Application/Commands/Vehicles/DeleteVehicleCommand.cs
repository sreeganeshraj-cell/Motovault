using MediatR;

namespace MotoVault.Application.Commands.Vehicles;

public record DeleteVehicleCommand(Guid Id) : IRequest<Unit>;
