using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MotoVault.Application.Commands.Subscriptions;
using MotoVault.Application.DTOs.Subscriptions;
using MotoVault.Application.Queries.Subscriptions;
using MotoVault.Domain.Enums;

namespace MotoVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SubscriptionsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllSubscriptionsQuery());
        return Ok(result);
    }

    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPending()
    {
        var result = await _mediator.Send(new GetPendingSubscriptionsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetSubscriptionByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("vehicle/{vehicleId:guid}")]
    public async Task<IActionResult> GetByVehicle(Guid vehicleId)
    {
        var result = await _mediator.Send(new GetSubscriptionsByVehicleIdQuery(vehicleId));
        return Ok(result);
    }

    [HttpGet("vehicle/{vehicleId:guid}/active")]
    public async Task<IActionResult> GetActiveByVehicle(Guid vehicleId)
    {
        var result = await _mediator.Send(new GetActiveSubscriptionByVehicleIdQuery(vehicleId));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSubscriptionRequest request)
    {
        var result = await _mediator.Send(new CreateSubscriptionCommand(
            request.VehicleId, request.PackageId, request.SlotId, request.StartDate, request.EndDate));
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("book")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> Book([FromBody] BookSubscriptionRequest request)
    {
        var ownerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var ownerName = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
        var result = await _mediator.Send(new BookSubscriptionCommand(
            ownerId, ownerName,
            request.VehicleType, request.Brand, request.Model, request.RegistrationNumber,
            request.PackageId, request.StartDate, request.EndDate));
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _mediator.Send(new ApproveSubscriptionCommand(id));
        return NoContent();
    }

    [HttpPut("{id:guid}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] UpdateSubscriptionRequest request)
    {
        if (request.EndDate is null)
            return BadRequest("EndDate is required.");

        await _mediator.Send(new CancelSubscriptionCommand(id, request.EndDate.Value));
        return NoContent();
    }

    [HttpPut("{id:guid}/complete")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] UpdateSubscriptionRequest request)
    {
        if (request.EndDate is null)
            return BadRequest("EndDate is required.");

        await _mediator.Send(new CompleteSubscriptionCommand(id, request.EndDate.Value));
        return NoContent();
    }
}
