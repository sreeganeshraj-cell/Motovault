using MediatR;
using MotoVault.Application.DTOs.StorageSlots;

namespace MotoVault.Application.Queries.StorageSlots;

public record GetStorageSlotByIdQuery(Guid Id) : IRequest<StorageSlotResponse?>;
