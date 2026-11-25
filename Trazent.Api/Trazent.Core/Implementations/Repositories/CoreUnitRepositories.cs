using Npgsql;
using Trazent.Api.Core.Infraestructure.Repositories;
using Trazent.Core.Infraestructure.Repositories;

namespace Trazent.Api.Core.Implementations.Repositories;

public class CoreUnitRepositories : ICoreUnitRepositories
{
    NpgsqlConnection _connection = default!;
    NpgsqlTransaction? _transaction;
    public ICompaniesRepository CompaniesRepository { get; }
    public IUsersRepository UsersRepository { get; }
    public ISitesRepository SitesRepository { get; }
    public IContractorsRepository ContractorsRepository { get; }

    public CoreUnitRepositories(ICompaniesRepository companiesRepository, IUsersRepository usersRepository, ISitesRepository sitesRepository, IContractorsRepository contractorsRepository)
    {
        CompaniesRepository = companiesRepository;
        UsersRepository = usersRepository;
        SitesRepository = sitesRepository;
        ContractorsRepository = contractorsRepository;
    }

    public void SetConnection(NpgsqlConnection connection, NpgsqlTransaction? transaction = null)
    {
        _connection = connection ?? throw new ArgumentNullException(nameof(connection));
        _transaction = transaction;

        CompaniesRepository.SetConnection(_connection, _transaction);
        UsersRepository.SetConnection(_connection, _transaction);
        SitesRepository.SetConnection(_connection, _transaction);
        ContractorsRepository.SetConnection(_connection, _transaction);

    }
}
