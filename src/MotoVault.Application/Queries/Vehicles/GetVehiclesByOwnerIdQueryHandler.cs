using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Vehicles;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Vehicles;

public class GetVehiclesByOwnerIdQueryHandler : IRequestHandler<GetVehiclesByOwnerIdQuery, IEnumerable<VehicleResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetVehiclesByOwnerIdQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<VehicleResponse>> Handle(GetVehiclesByOwnerIdQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT v."Id", v."OwnerId", u."Name" AS "OwnerName",
                   v."Type", v."Brand", v."Model",
                   v."RegistrationNumber", v."CreatedAt"
            FROM "Vehicles" v
            INNER JOIN "Users" u ON v."OwnerId" = u."Id"
            WHERE v."OwnerId" = @OwnerId
            ORDER BY v."CreatedAt" DESC
            """;

        return await connection.QueryAsync<VehicleResponse>(sql, new { request.OwnerId });
    }
}
