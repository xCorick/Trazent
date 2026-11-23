using Npgsql;
using Trazent.Api.Core.Infraestructure.Repositories;

namespace Trazent.Api.Core.Implementations.Repositories;

public class CoreUnitRepositories : ICoreUnitRepositories
{
    NpgsqlConnection _connection = default!;
    NpgsqlTransaction? _transaction;
    public ICompaniesRepository CompaniesRepository { get; }

    public CoreUnitRepositories(ICompaniesRepository companiesRepository)
    {
        CompaniesRepository = companiesRepository;
    }

    public void SetConnection(NpgsqlConnection connection, NpgsqlTransaction? transaction = null)
    {
        _connection = connection ?? throw new ArgumentNullException(nameof(connection));
        _transaction = transaction;

        CompaniesRepository.SetConnection(_connection, _transaction);
    }
}
