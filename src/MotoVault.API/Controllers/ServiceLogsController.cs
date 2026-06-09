using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MotoVault.Application.Commands.ServiceLogs;
using MotoVault.Application.DTOs.ServiceLogs;
using MotoVault.Application.Queries.ServiceLogs;

namespace MotoVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ServiceLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ServiceLogsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllServiceLogsQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetServiceLogByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("vehicle/{vehicleId:guid}")]
    public async Task<IActionResult> GetByVehicle(Guid vehicleId)
    {
        var result = await _mediator.Send(new GetServiceLogsByVehicleIdQuery(vehicleId));
        return Ok(result);
    }

    [HttpGet("subscription/{subscriptionId:guid}")]
    public async Task<IActionResult> GetBySubscription(Guid subscriptionId)
    {
        var result = await _mediator.Send(new GetServiceLogsBySubscriptionIdQuery(subscriptionId));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateServiceLogRequest request)
    {
        var result = await _mediator.Send(new CreateServiceLogCommand(
            request.VehicleId, request.SubscriptionId, request.ServiceDate,
            request.ServiceType, request.Notes, request.CreatedBy));
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateServiceLogRequest request)
    {
        var result = await _mediator.Send(new UpdateServiceLogCommand(id, request.Notes));
        return Ok(result);
    }
}
