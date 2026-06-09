using MotoVault.Domain.Common;
using MotoVault.Domain.Enums;

namespace MotoVault.Domain.Entities;

public class ServiceMedia : Entity
{
    public Guid ServiceLogId { get; private set; }
    public string FileUrl { get; private set; } = string.Empty;
    public MediaType? MediaType { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ServiceLog ServiceLog { get; private set; } = null!;

    private ServiceMedia() { }

    public static ServiceMedia Create(Guid serviceLogId, string fileUrl, MediaType? mediaType)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            throw new ArgumentException("File URL cannot be empty.");

        return new ServiceMedia
        {
            ServiceLogId = serviceLogId,
            FileUrl = fileUrl.Trim(),
            MediaType = mediaType
        };
    }
}
