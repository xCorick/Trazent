using Npgsql;
using System;
using System.Collections.Generic;
using System.Text;

namespace Trazent.Api.DataAccess
{
    public interface IAppDbContext
    {
        Task OpenConnectionAsync();
        NpgsqlConnection Connection { get; }
        NpgsqlTransaction Transaction { get; }
        Task ExecuteInTransactionAsync(Func<Task> action);
        Task EnsureConnectionAsync();

    }
}
