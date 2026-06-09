using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.ServiceMedia;

public class CreateServiceMediaRequest
{
    public Guid ServiceLogId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public MediaType? MediaType { get; set; }
}
