using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.StorageSlots;

public class UpdateStorageSlotStatusRequest
{
    public SlotStatus Status { get; set; }
}
