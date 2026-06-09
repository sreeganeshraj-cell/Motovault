using System.Data;

namespace MotoVault.Application.Interfaces;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
