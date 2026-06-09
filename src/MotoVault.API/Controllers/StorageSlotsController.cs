using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MotoVault.Application.Commands.StorageSlots;
using MotoVault.Application.DTOs.StorageSlots;
using MotoVault.Application.Queries.StorageSlots;
using MotoVault.Domain.Enums;

namespace MotoVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StorageSlotsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorageSlotsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllStorageSlotsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetStorageSlotByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable([FromQuery] VehicleType type)
    {
        var result = await _mediator.Send(new GetAvailableSlotsByTypeQuery(type));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateStorageSlotRequest request)
    {
        var result = await _mediator.Send(new CreateStorageSlotCommand(
            request.SlotNumber, request.Type));
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStorageSlotStatusRequest request)
    {
        var result = await _mediator.Send(new UpdateStorageSlotStatusCommand(id, request.Status));
        return Ok(result);
    }
}
