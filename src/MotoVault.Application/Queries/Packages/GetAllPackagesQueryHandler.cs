using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Packages;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Packages;

public class GetAllPackagesQueryHandler : IRequestHandler<GetAllPackagesQuery, IEnumerable<PackageResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetAllPackagesQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<PackageResponse>> Handle(GetAllPackagesQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT "Id", "Name", "Description", "Price", "IsActive", "CreatedAt"
            FROM "Packages"
            WHERE (@ActiveOnly = false OR "IsActive" = true)
            ORDER BY "CreatedAt"
            """;

        return await connection.QueryAsync<PackageResponse>(sql, new { request.ActiveOnly });
    }
}
