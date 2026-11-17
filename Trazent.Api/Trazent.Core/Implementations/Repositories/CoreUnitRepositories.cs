using Trazent.Api.Core.Infraestructure.Repositories;

namespace Trazent.Api.Core.Implementations.Repositories;

public sealed class CoreUnitRepositories(ICompaniesRepository companiesRepository)
    : ICoreUnitRepositories
{
    public ICompaniesRepository CompaniesRepository { get; } = companiesRepository;
}
