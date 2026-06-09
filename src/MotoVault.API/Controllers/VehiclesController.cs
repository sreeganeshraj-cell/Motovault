using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MotoVault.Application.Commands.Vehicles;
using MotoVault.Application.DTOs.Vehicles;
using MotoVault.Application.Queries.Vehicles;

namespace MotoVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VehiclesController : ControllerBase
{
    private readonly IMediator _mediator;

    public VehiclesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllVehiclesQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetVehicleByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("owner/{ownerId:guid}")]
    public async Task<IActionResult> GetByOwner(Guid ownerId)
    {
        var result = await _mediator.Send(new GetVehiclesByOwnerIdQuery(ownerId));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateVehicleRequest request)
    {
        var result = await _mediator.Send(new CreateVehicleCommand(
            request.OwnerId, request.Type, request.Brand, request.Model, request.RegistrationNumber));
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVehicleRequest request)
    {
        var result = await _mediator.Send(new UpdateVehicleCommand(
            id, request.Brand, request.Model, request.RegistrationNumber));
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteVehicleCommand(id));
        return NoContent();
    }
}
