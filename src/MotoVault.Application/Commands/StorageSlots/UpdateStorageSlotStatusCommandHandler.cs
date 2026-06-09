using MediatR;
using MotoVault.Application.DTOs.StorageSlots;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Enums;

namespace MotoVault.Application.Commands.StorageSlots;

public class UpdateStorageSlotStatusCommandHandler : IRequestHandler<UpdateStorageSlotStatusCommand, StorageSlotResponse>
{
    private readonly IStorageSlotRepository _slotRepository;

    public UpdateStorageSlotStatusCommandHandler(IStorageSlotRepository slotRepository)
    {
        _slotRepository = slotRepository;
    }

    public async Task<StorageSlotResponse> Handle(UpdateStorageSlotStatusCommand request, CancellationToken cancellationToken)
    {
        var slot = await _slotRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"StorageSlot {request.Id} not found.");

        if (request.Status == SlotStatus.Occupied)
            slot.MarkOccupied();
        else
            slot.MarkAvailable();

        await _slotRepository.UpdateAsync(slot);

        return new StorageSlotResponse
        {
            Id = slot.Id,
            SlotNumber = slot.SlotNumber,
            Type = slot.Type,
            Status = slot.Status,
            CreatedAt = slot.CreatedAt
        };
    }
}
