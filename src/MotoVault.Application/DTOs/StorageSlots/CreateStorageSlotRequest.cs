using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.StorageSlots;

public class CreateStorageSlotRequest
{
    public int SlotNumber { get; set; }
    public VehicleType Type { get; set; }
}
