using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Subscriptions;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Subscriptions;

public class GetAllSubscriptionsQueryHandler : IRequestHandler<GetAllSubscriptionsQuery, IEnumerable<SubscriptionResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetAllSubscriptionsQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<SubscriptionResponse>> Handle(GetAllSubscriptionsQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT s."Id", s."VehicleId",
                   v."RegistrationNumber" AS "VehicleRegistrationNumber",
                   v."Type"              AS "VehicleType",
                   u."Name"              AS "OwnerName",
                   s."PackageId", p."Name" AS "PackageName",
                   s."SlotId", sl."SlotNumber",
                   s."StartDate", s."EndDate", s."Status", s."CreatedAt"
            FROM "Subscriptions" s
            INNER JOIN "Vehicles"     v  ON s."VehicleId" = v."Id"
            INNER JOIN "Users"        u  ON v."OwnerId"   = u."Id"
            INNER JOIN "Packages"     p  ON s."PackageId" = p."Id"
            INNER JOIN "StorageSlots" sl ON s."SlotId"    = sl."Id"
            ORDER BY s."CreatedAt" DESC
            """;

        return await connection.QueryAsync<SubscriptionResponse>(sql);
    }
}
