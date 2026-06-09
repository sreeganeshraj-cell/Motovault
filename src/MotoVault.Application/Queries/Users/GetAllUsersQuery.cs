using MediatR;
using MotoVault.Application.DTOs.Users;

namespace MotoVault.Application.Queries.Users;

public record GetAllUsersQuery : IRequest<IEnumerable<UserResponse>>;
