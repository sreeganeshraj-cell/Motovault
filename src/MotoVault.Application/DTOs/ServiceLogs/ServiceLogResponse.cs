using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.ServiceLogs;

public class ServiceLogResponse
{
    public Guid Id { get; set; }

    public Guid VehicleId { get; set; }
    public string VehicleRegistrationNumber { get; set; } = string.Empty;

    public Guid SubscriptionId { get; set; }

    public DateOnly ServiceDate { get; set; }
    public ServiceType ServiceType { get; set; }
    public string? Notes { get; set; }

    public Guid? CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }

    public int MediaCount { get; set; }
}
