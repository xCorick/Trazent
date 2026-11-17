using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using Trazent.DataAccess;


namespace Trazent.Api.DataAccess
{
    public class DatabaseConnection : IDatabaseConnection
    {
        private readonly string _connectionString;
        private readonly ILogger<DatabaseConnection> _logger;

        public DatabaseConnection(IConfiguration configuration, ILogger<DatabaseConnection> logger)
        {
            _connectionString = configuration.GetConnectionString("ApplicationDBServer") 
                ?? throw new ArgumentNullException("Connection string 'ApplicationDBServer' not found in configuration.");
            _logger = logger;
        }

        public async Task<NpgsqlConnection> CreateConnectionAsync(CancellationToken cancellationToken)
        {
            NpgsqlConnection? connection = null;
            try
            {
                connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync(cancellationToken);

                _logger.LogInformation("Database connection established successfully.");
                return connection;
            }
            catch (Exception ex)
            {
                if (connection is not null)
                {
                    await connection.DisposeAsync();
                }

                if (ex is NpgsqlException)
                {
                    _logger.LogError(ex, "Database connection failed. NpgsqlException: {Message}", ex.Message);
                    throw new DatabaseConnectionException("Failed to connect to the database.", ex);
                }

                if (ex is TimeoutException)
                {
                    _logger.LogError(ex, "Database connection timed out.");
                    throw new DatabaseConnectionException("Database connection timed out.", ex);
                }

                _logger.LogError(ex, "Unexpected error when connecting to the database.");
                throw new DatabaseConnectionException("Unexpected database connection error.", ex);
            }
        }
    }
}
