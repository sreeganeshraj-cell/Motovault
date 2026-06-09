using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.ServiceMedia;

public class ServiceMediaResponse
{
    public Guid Id { get; set; }
    public Guid ServiceLogId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public MediaType? MediaType { get; set; }
    public DateTime CreatedAt { get; set; }
}
