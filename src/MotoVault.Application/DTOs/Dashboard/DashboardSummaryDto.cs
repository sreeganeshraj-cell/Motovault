namespace MotoVault.Application.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public int BikesInStorage { get; set; }
    public int CarsInStorage { get; set; }
    public int BikeSlotsTotal { get; set; }
    public int BikeSlotsOccupied { get; set; }
    public int CarSlotsTotal { get; set; }
    public int CarSlotsOccupied { get; set; }
    public int ActiveSubscriptionsCount { get; set; }
    public int OverdueCount { get; set; }
    public int PendingRequestsCount { get; set; }
    public IEnumerable<ActiveVehicleDto> ActiveVehicles { get; set; } = [];
    public IEnumerable<RecentActivityDto> RecentActivity { get; set; } = [];
}

public class ActiveVehicleDto
{
    public string VehicleType { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? RegistrationNumber { get; set; }
    public int SlotNumber { get; set; }
    public string SlotType { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
}

public class RecentActivityDto
{
    public string ServiceType { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }
}
