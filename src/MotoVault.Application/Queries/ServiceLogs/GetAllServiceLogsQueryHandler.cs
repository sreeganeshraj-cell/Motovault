using Dapper;
using MediatR;
using MotoVault.Application.DTOs.ServiceLogs;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.ServiceLogs;

public class GetAllServiceLogsQueryHandler : IRequestHandler<GetAllServiceLogsQuery, IEnumerable<ServiceLogResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetAllServiceLogsQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<ServiceLogResponse>> Handle(GetAllServiceLogsQuery request, CancellationToken cancellationToken)
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
            ORDER BY sl."ServiceDate" DESC
            """;

        return await connection.QueryAsync<ServiceLogResponse>(sql);
    }
}
