using MediatR;
using MotoVault.Application.DTOs.StorageSlots;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Queries.StorageSlots;

public record GetAvailableSlotsByTypeQuery(VehicleType Type) : IRequest<IEnumerable<StorageSlotResponse>>;
