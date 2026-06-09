using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Vehicles;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Vehicles;

public class GetVehicleByIdQueryHandler : IRequestHandler<GetVehicleByIdQuery, VehicleResponse?>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetVehicleByIdQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<VehicleResponse?> Handle(GetVehicleByIdQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT v."Id", v."OwnerId", u."Name" AS "OwnerName",
                   v."Type", v."Brand", v."Model",
                   v."RegistrationNumber", v."CreatedAt"
            FROM "Vehicles" v
            INNER JOIN "Users" u ON v."OwnerId" = u."Id"
            WHERE v."Id" = @Id
            """;

        return await connection.QuerySingleOrDefaultAsync<VehicleResponse>(sql, new { request.Id });
    }
}
