using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Subscriptions;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Subscriptions;

public class GetPendingSubscriptionsQueryHandler : IRequestHandler<GetPendingSubscriptionsQuery, IEnumerable<PendingSubscriptionDto>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetPendingSubscriptionsQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<PendingSubscriptionDto>> Handle(GetPendingSubscriptionsQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT s."Id", u."Name" AS "OwnerName",
                   v."Type" AS "VehicleType", v."Brand", v."Model",
                   v."RegistrationNumber", p."Name" AS "PackageName",
                   s."StartDate", s."CreatedAt"
            FROM "Subscriptions" s
            INNER JOIN "Vehicles" v ON v."Id"  = s."VehicleId"
            INNER JOIN "Users"    u ON u."Id"  = v."OwnerId"
            INNER JOIN "Packages" p ON p."Id"  = s."PackageId"
            WHERE s."Status" = 'Requested'
            ORDER BY s."CreatedAt" DESC
            """;

        return await connection.QueryAsync<PendingSubscriptionDto>(sql);
    }
}
