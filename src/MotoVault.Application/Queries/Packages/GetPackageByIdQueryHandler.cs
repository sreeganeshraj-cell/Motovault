using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Packages;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Packages;

public class GetPackageByIdQueryHandler : IRequestHandler<GetPackageByIdQuery, PackageResponse?>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetPackageByIdQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PackageResponse?> Handle(GetPackageByIdQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT "Id", "Name", "Description", "Price", "IsActive", "CreatedAt"
            FROM "Packages"
            WHERE "Id" = @Id
            """;

        return await connection.QuerySingleOrDefaultAsync<PackageResponse>(sql, new { request.Id });
    }
}
