using Npgsql;
using System;
using System.Collections.Generic;
using System.Text;

namespace Trazent.Core.Infraestructure.Repositories
{
    public interface IRepositoryBase
    {
        void SetConnection(NpgsqlConnection connection, NpgsqlTransaction? transaction = null);
    }
}
