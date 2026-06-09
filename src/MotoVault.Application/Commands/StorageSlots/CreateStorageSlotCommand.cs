using MediatR;
using MotoVault.Application.DTOs.StorageSlots;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.StorageSlots;

public record CreateStorageSlotCommand(
    int SlotNumber,
    VehicleType Type
) : IRequest<StorageSlotResponse>;
