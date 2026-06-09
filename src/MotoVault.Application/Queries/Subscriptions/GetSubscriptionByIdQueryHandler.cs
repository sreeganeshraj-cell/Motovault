using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Subscriptions;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Subscriptions;

public class GetSubscriptionByIdQueryHandler : IRequestHandler<GetSubscriptionByIdQuery, SubscriptionResponse?>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetSubscriptionByIdQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<SubscriptionResponse?> Handle(GetSubscriptionByIdQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT s."Id", s."VehicleId",
                   v."RegistrationNumber" AS "VehicleRegistrationNumber",
                   s."PackageId", p."Name" AS "PackageName",
                   s."SlotId", sl."SlotNumber",
                   s."StartDate", s."EndDate", s."Status", s."CreatedAt"
            FROM "Subscriptions" s
            INNER JOIN "Vehicles" v ON s."VehicleId" = v."Id"
            INNER JOIN "Packages" p ON s."PackageId" = p."Id"
            INNER JOIN "StorageSlots" sl ON s."SlotId" = sl."Id"
            WHERE s."Id" = @Id
            """;

        return await connection.QuerySingleOrDefaultAsync<SubscriptionResponse>(sql, new { request.Id });
    }
}
