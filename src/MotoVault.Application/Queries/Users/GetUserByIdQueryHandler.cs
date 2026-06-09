using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Users;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Users;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserResponse?>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetUserByIdQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<UserResponse?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT "Id", "Name", "Role", "Phone", "Email", "CreatedAt"
            FROM "Users"
            WHERE "Id" = @Id
            """;

        return await connection.QuerySingleOrDefaultAsync<UserResponse>(sql, new { request.Id });
    }
}
