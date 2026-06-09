using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MotoVault.Application.Commands.Packages;
using MotoVault.Application.DTOs.Packages;
using MotoVault.Application.Queries.Packages;

namespace MotoVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PackagesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PackagesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllPackagesQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetPackageByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePackageRequest request)
    {
        var result = await _mediator.Send(new CreatePackageCommand(
            request.Name, request.Description, request.Price));
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePackageRequest request)
    {
        var result = await _mediator.Send(new UpdatePackageCommand(
            id, request.Name, request.Description, request.Price));
        return Ok(result);
    }

    [HttpPut("{id:guid}/retire")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Retire(Guid id)
    {
        var result = await _mediator.Send(new RetirePackageCommand(id));
        return Ok(result);
    }

    [HttpPut("{id:guid}/reactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reactivate(Guid id)
    {
        var result = await _mediator.Send(new ReactivatePackageCommand(id));
        return Ok(result);
    }
}
