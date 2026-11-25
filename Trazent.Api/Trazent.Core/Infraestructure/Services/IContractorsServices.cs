using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;
using Trazent.Infraestructure.Models;

namespace Trazent.Core.Infraestructure.Services;

public interface IContractorsServices
{
    Task<IResult<Contractors>> CreateContractorAsync(Contractors contractor, string? password);
    Task<IResult<Contractors>> GetContractorByIdAsync(Guid id, Guid? companyId = null);
    Task<IResult<List<Contractors>>> GetContractorsByCompanyAsync(Guid companyId, StatusTypeEnum? status = null);
    Task<IResult<Contractors>> UpdateContractorAsync(Contractors contractor);
    Task<IResult<Contractors>> ChangeContractorStatusAsync(Guid id, Guid? companyId, StatusTypeEnum status);
}
