using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.ServiceLogs;

public class CreateServiceLogRequest
{
    public Guid VehicleId { get; set; }
    public Guid SubscriptionId { get; set; }
    public DateOnly ServiceDate { get; set; }
    public ServiceType ServiceType { get; set; }
    public string? Notes { get; set; }
    public Guid? CreatedBy { get; set; }
}
