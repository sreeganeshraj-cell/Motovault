using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.StorageSlots;

public class StorageSlotResponse
{
    public Guid Id { get; set; }
    public int SlotNumber { get; set; }
    public VehicleType Type { get; set; }
    public SlotStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
