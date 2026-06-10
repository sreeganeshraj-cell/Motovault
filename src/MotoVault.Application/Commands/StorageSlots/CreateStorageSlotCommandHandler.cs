using MediatR;
using MotoVault.Application.DTOs.StorageSlots;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;

namespace MotoVault.Application.Commands.StorageSlots;

public class CreateStorageSlotCommandHandler : IRequestHandler<CreateStorageSlotCommand, StorageSlotResponse>
{
    private readonly IStorageSlotRepository _slotRepository;

    public CreateStorageSlotCommandHandler(IStorageSlotRepository slotRepository)
    {
        _slotRepository = slotRepository;
    }

    private const int MaxSlotsPerType = 15;

    public async Task<StorageSlotResponse> Handle(CreateStorageSlotCommand request, CancellationToken cancellationToken)
    {
        var existingCount = await _slotRepository.CountByTypeAsync(request.Type);
        if (existingCount >= MaxSlotsPerType)
            throw new InvalidOperationException($"Maximum {MaxSlotsPerType} {request.Type} slots already exist.");

        var slot = StorageSlot.Create(request.SlotNumber, request.Type);

        await _slotRepository.AddAsync(slot);

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
