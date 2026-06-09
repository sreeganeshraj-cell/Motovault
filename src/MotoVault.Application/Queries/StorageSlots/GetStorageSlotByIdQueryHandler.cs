using Dapper;
using MediatR;
using MotoVault.Application.DTOs.StorageSlots;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.StorageSlots;

public class GetStorageSlotByIdQueryHandler : IRequestHandler<GetStorageSlotByIdQuery, StorageSlotResponse?>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetStorageSlotByIdQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<StorageSlotResponse?> Handle(GetStorageSlotByIdQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT "Id", "SlotNumber", "Type", "Status", "CreatedAt"
            FROM "StorageSlots"
            WHERE "Id" = @Id
            """;

        return await connection.QuerySingleOrDefaultAsync<StorageSlotResponse>(sql, new { request.Id });
    }
}
