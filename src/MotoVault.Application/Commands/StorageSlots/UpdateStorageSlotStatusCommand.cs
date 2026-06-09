using MediatR;
using MotoVault.Application.DTOs.StorageSlots;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.StorageSlots;

public record UpdateStorageSlotStatusCommand(
    Guid Id,
    SlotStatus Status
) : IRequest<StorageSlotResponse>;
