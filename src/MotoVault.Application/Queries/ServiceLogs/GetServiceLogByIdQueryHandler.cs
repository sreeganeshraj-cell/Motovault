using Dapper;
using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.ServiceLogs;

public class GetServiceLogByIdQueryHandler : IRequestHandler<GetServiceLogByIdQuery, ServiceLogResponse?>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetServiceLogByIdQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<ServiceLogResponse?> Handle(GetServiceLogByIdQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT sl."Id", sl."VehicleId",
                   v."RegistrationNumber" AS "VehicleRegistrationNumber",
                   sl."SubscriptionId",
                   sl."ServiceDate", sl."ServiceType", sl."Notes",
                   sl."CreatedBy", sl."CreatedAt",
                   u."Name" AS "CreatedByName",
                   (SELECT COUNT(*) FROM "ServiceMedia" sm WHERE sm."ServiceLogId" = sl."Id") AS "MediaCount"
            FROM "ServiceLogs" sl
            INNER JOIN "Vehicles" v ON sl."VehicleId" = v."Id"
            LEFT JOIN "Users" u ON sl."CreatedBy" = u."Id"
            WHERE sl."Id" = @Id
            """;

        return await connection.QuerySingleOrDefaultAsync<ServiceLogResponse>(sql, new { request.Id });
    }
}
