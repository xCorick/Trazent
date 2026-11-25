using Trazent.Infraestructure.Common.Entities;

namespace Trazent.Core.Infraestructure.Repositories;

public interface IContractorsRepository : IRepositoryBase
{
    Task<Contractors?> CreateContractorAsync(Contractors contractor, string passwordHash, string securityStamp, string concurrencyStamp);
    Task<Contractors?> GetContractorByIdAsync(Guid id, Guid? companyId = null);
    Task<List<Contractors>> GetContractorsByCompanyAsync(Guid companyId, short? status = null);
    Task<Contractors?> UpdateContractorAsync(Contractors contractor);
    Task<Contractors?> ChangeContractorStatusAsync(Guid id, Guid? companyId, short status);
}
