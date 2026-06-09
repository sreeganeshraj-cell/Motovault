using MotoVault.Domain.Enums;

namespace MotoVault.Application.DTOs.Subscriptions;

public class UpdateSubscriptionRequest
{
    public SubscriptionStatus Status { get; set; }
    public DateOnly? EndDate { get; set; }
}
