using Dapper;
using MediatR;
using MotoVault.Application.DTOs.ServiceMedia;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.ServiceMedia;

public class GetServiceMediaByIdQueryHandler : IRequestHandler<GetServiceMediaByIdQuery, ServiceMediaResponse?>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetServiceMediaByIdQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<ServiceMediaResponse?> Handle(GetServiceMediaByIdQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT sm."Id", sm."ServiceLogId", sm."FileUrl", sm."MediaType", sm."CreatedAt"
            FROM "ServiceMedia" sm
            WHERE sm."Id" = @Id
            """;

        return await connection.QuerySingleOrDefaultAsync<ServiceMediaResponse>(sql, new { request.Id });
    }
}
