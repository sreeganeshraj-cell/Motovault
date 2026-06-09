using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MotoVault.Application.Commands.ServiceMedia;
using MotoVault.Application.DTOs.ServiceMedia;
using MotoVault.Application.Queries.ServiceMedia;
using MotoVault.Domain.Enums;

namespace MotoVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ServiceMediaController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IWebHostEnvironment _env;

    public ServiceMediaController(IMediator mediator, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _env = env;
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Admin,Staff")]
    [RequestSizeLimit(20_971_520)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file provided.");

        var isImage = file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
        var isVideo = file.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase);

        if (!isImage && !isVideo)
            return BadRequest("Only image and video files are accepted.");

        var allowedExts = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".avi" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExts.Contains(ext))
            ext = isVideo ? ".mp4" : ".jpg";

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads", "media");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream);

        var fileUrl = $"/uploads/media/{fileName}";
        var mediaType = isVideo ? MediaType.Video : MediaType.Image;

        return Ok(new { fileUrl, mediaType });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetServiceMediaByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("service-log/{serviceLogId:guid}")]
    public async Task<IActionResult> GetByServiceLog(Guid serviceLogId)
    {
        var result = await _mediator.Send(new GetServiceMediaByServiceLogIdQuery(serviceLogId));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateServiceMediaRequest request)
    {
        var result = await _mediator.Send(new CreateServiceMediaCommand(
            request.ServiceLogId, request.FileUrl, request.MediaType));
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteServiceMediaCommand(id));
        return NoContent();
    }
}
