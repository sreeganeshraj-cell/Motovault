using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Dashboard;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Dashboard;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetDashboardSummaryQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();
        var dto = new DashboardSummaryDto();

        // ── aggregate counts from active subscriptions ──────────────────────
        const string countsSql = """
            SELECT
                COUNT(*) FILTER (WHERE v."Type" = 'Bike' AND s."Status" = 'Active') AS "BikesInStorage",
                COUNT(*) FILTER (WHERE v."Type" = 'Car'  AND s."Status" = 'Active') AS "CarsInStorage",
                COUNT(*) FILTER (WHERE s."Status" = 'Active')                       AS "ActiveSubscriptionsCount",
                COUNT(*) FILTER (WHERE s."Status" = 'Active'
                                   AND s."EndDate" IS NOT NULL
                                   AND s."EndDate" < CURRENT_DATE)                  AS "OverdueCount",
                COUNT(*) FILTER (WHERE s."Status" = 'Requested')                    AS "PendingRequestsCount"
            FROM "Subscriptions" s
            INNER JOIN "Vehicles" v ON v."Id" = s."VehicleId"
            """;

        var counts = await connection.QuerySingleAsync<CountsResult>(countsSql);
        dto.BikesInStorage            = (int)counts.BikesInStorage;
        dto.CarsInStorage             = (int)counts.CarsInStorage;
        dto.ActiveSubscriptionsCount  = (int)counts.ActiveSubscriptionsCount;
        dto.OverdueCount              = (int)counts.OverdueCount;
        dto.PendingRequestsCount      = (int)counts.PendingRequestsCount;

        // ── slot occupancy grouped by type and status ────────────────────────
        const string slotsSql = """
            SELECT "Type", "Status", COUNT(*) AS "Count"
            FROM "StorageSlots"
            GROUP BY "Type", "Status"
            """;

        var slotGroups = (await connection.QueryAsync<SlotGroupRow>(slotsSql)).ToList();
        dto.BikeSlotsTotal    = slotGroups.Where(g => g.Type == "Bike").Sum(g => g.Count);
        dto.BikeSlotsOccupied = slotGroups.Where(g => g.Type == "Bike" && g.Status == "Occupied").Sum(g => g.Count);
        dto.CarSlotsTotal     = slotGroups.Where(g => g.Type == "Car").Sum(g => g.Count);
        dto.CarSlotsOccupied  = slotGroups.Where(g => g.Type == "Car" && g.Status == "Occupied").Sum(g => g.Count);

        // ── active vehicles for the table ────────────────────────────────────
        const string vehiclesSql = """
            SELECT v."Type" AS "VehicleType", v."Brand", v."Model",
                   v."RegistrationNumber", sl."SlotNumber",
                   sl."Type" AS "SlotType", s."StartDate"
            FROM "Subscriptions" s
            INNER JOIN "Vehicles"     v  ON v."Id"  = s."VehicleId"
            INNER JOIN "StorageSlots" sl ON sl."Id" = s."SlotId"
            WHERE s."Status" = 'Active'
            ORDER BY s."CreatedAt" DESC
            LIMIT 8
            """;

        dto.ActiveVehicles = (await connection.QueryAsync<ActiveVehicleDto>(vehiclesSql)).ToList();

        // ── recent service activity ──────────────────────────────────────────
        const string activitySql = """
            SELECT slog."ServiceType", v."Brand", v."Model",
                   v."RegistrationNumber", u."Name" AS "CreatedByName",
                   slog."CreatedAt", slog."Notes"
            FROM "ServiceLogs" slog
            INNER JOIN "Vehicles" v ON v."Id" = slog."VehicleId"
            LEFT  JOIN "Users"    u ON u."Id" = slog."CreatedBy"
            ORDER BY slog."CreatedAt" DESC
            LIMIT 6
            """;

        dto.RecentActivity = (await connection.QueryAsync<RecentActivityDto>(activitySql)).ToList();

        return dto;
    }

    private class CountsResult
    {
        public long BikesInStorage           { get; set; }
        public long CarsInStorage            { get; set; }
        public long ActiveSubscriptionsCount { get; set; }
        public long OverdueCount             { get; set; }
        public long PendingRequestsCount     { get; set; }
    }

    private class SlotGroupRow
    {
        public string Type   { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int    Count  { get; set; }
    }
}
