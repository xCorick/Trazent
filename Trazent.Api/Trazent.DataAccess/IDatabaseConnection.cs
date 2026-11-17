using Npgsql;

namespace Trazent.Api.DataAccess
{
    public interface IDatabaseConnection
    {
        Task<NpgsqlConnection> CreateConnectionAsync(CancellationToken cancellationToken = default!);
    }
}
