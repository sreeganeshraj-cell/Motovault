using Dapper;
using MediatR;
using MotoVault.Application.DTOs.ServiceMedia;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.ServiceMedia;

public class GetServiceMediaByServiceLogIdQueryHandler : IRequestHandler<GetServiceMediaByServiceLogIdQuery, IEnumerable<ServiceMediaResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetServiceMediaByServiceLogIdQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<ServiceMediaResponse>> Handle(GetServiceMediaByServiceLogIdQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT sm."Id", sm."ServiceLogId", sm."FileUrl", sm."MediaType", sm."CreatedAt"
            FROM "ServiceMedia" sm
            WHERE sm."ServiceLogId" = @ServiceLogId
            ORDER BY sm."CreatedAt" ASC
            """;

        return await connection.QueryAsync<ServiceMediaResponse>(sql, new { request.ServiceLogId });
    }
}
