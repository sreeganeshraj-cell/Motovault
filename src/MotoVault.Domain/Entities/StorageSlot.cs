using MotoVault.Domain.Common;
using MotoVault.Domain.Enums;

namespace MotoVault.Domain.Entities;

public class StorageSlot : AggregateRoot
{
    public int SlotNumber { get; private set; }
    public VehicleType Type { get; private set; }
    public SlotStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private StorageSlot() { }

    public static StorageSlot Create(int slotNumber, VehicleType type)
    {
        if (slotNumber <= 0)
            throw new ArgumentException("Slot number must be greater than zero.");

        return new StorageSlot
        {
            SlotNumber = slotNumber,
            Type = type,
            Status = SlotStatus.Available
        };
    }

    public void MarkOccupied()
    {
        if (Status == SlotStatus.Occupied)
            throw new InvalidOperationException("Slot is already occupied.");

        Status = SlotStatus.Occupied;
    }

    public void MarkAvailable()
    {
        if (Status == SlotStatus.Available)
            throw new InvalidOperationException("Slot is already available.");

        Status = SlotStatus.Available;
    }
}
