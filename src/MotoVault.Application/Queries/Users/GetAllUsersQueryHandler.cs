using Dapper;
using MediatR;
using MotoVault.Application.DTOs.Users;
using MotoVault.Application.Interfaces;

namespace MotoVault.Application.Queries.Users;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, IEnumerable<UserResponse>>
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GetAllUsersQueryHandler(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<UserResponse>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT "Id", "Name", "Role", "Phone", "Email", "CreatedAt"
            FROM "Users"
            ORDER BY "CreatedAt" DESC
            """;

        return await connection.QueryAsync<UserResponse>(sql);
    }
}
