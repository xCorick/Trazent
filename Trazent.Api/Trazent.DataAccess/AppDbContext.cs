using Microsoft.Extensions.Logging;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Text;

namespace Trazent.Api.DataAccess
{
    public class AppDbContext : IAppDbContext, IAsyncDisposable
    {
        private readonly IDatabaseConnection _connection;
        private readonly ILogger<AppDbContext> _logger;

        public NpgsqlConnection Connection { get; private set; } = default!;
        public NpgsqlTransaction Transaction { get; private set; } = default!;

        public AppDbContext(IDatabaseConnection connection, ILogger<AppDbContext> logger)
        {
            _connection = connection;
            _logger = logger;

        }

        public async Task OpenConnectionAsync()
        {
            try
            {
                Connection = await _connection.CreateConnectionAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during create connection.");
                throw;
            }
        }
        public async Task EnsureConnectionAsync()
        {
            try
            {
                Connection ??= await _connection.CreateConnectionAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during create connection.");
                throw;
            }
        }

        public async Task ExecuteInTransactionAsync(Func<Task> action)
        {
            await EnsureConnectionAsync();

            await using var transaction = await Connection.BeginTransactionAsync();
            Transaction = transaction;

            try
            {
                await action();
                await transaction.CommitAsync();
                _logger.LogInformation("Transaction committed via ExecuteInTransactionAsync.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during transaction. Rolling back via ExecuteInTransactionAsync...");
                await transaction.RollbackAsync();
                throw;
            }

        }

        public async ValueTask DisposeAsync()
        {
            if (Connection is not null)
            {
                await Connection.DisposeAsync();
                Connection = default!;
            }
        }
    }
}
