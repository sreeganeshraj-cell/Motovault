using Dapper;
using MediatR;
using MotoVault.Application.DTOs.StorageSlots;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.StorageSlots;

public class GetAvailableSlotsByTypeQueryHandler : IRequestHandler<GetAvailableSlotsByTypeQuery, IEnumerable<StorageSlotResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetAvailableSlotsByTypeQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<StorageSlotResponse>> Handle(GetAvailableSlotsByTypeQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT "Id", "SlotNumber", "Type", "Status", "CreatedAt"
            FROM "StorageSlots"
            WHERE "Type" = @Type AND "Status" = 'Available'
            ORDER BY "SlotNumber"
            """;

        return await connection.QueryAsync<StorageSlotResponse>(sql, new { Type = request.Type.ToString() });
    }
}
