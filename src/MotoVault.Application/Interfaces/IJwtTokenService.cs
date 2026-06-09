using MotoVault.Domain.Entities;

namespace MotoVault.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
