using Dapper;
using MediatR;
using MotoVault.Application.DTOs.StorageSlots;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.StorageSlots;

public class GetAllStorageSlotsQueryHandler : IRequestHandler<GetAllStorageSlotsQuery, IEnumerable<StorageSlotResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetAllStorageSlotsQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<StorageSlotResponse>> Handle(GetAllStorageSlotsQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT "Id", "SlotNumber", "Type", "Status", "CreatedAt"
            FROM "StorageSlots"
            ORDER BY "Type", "SlotNumber"
            """;

        return await connection.QueryAsync<StorageSlotResponse>(sql);
    }
}
