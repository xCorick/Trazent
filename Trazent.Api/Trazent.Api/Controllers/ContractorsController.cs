using AutoMapper;
using GraphQL.AspNet.Attributes;
using GraphQL.AspNet.Interfaces.Controllers;
using Trazent.Api.GraphQL.Types.ContractorsType;
using Trazent.Core.Infraestructure.Services;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;
using Trazent.Infraestructure.Common.Extensions;

namespace Trazent.Api.Controllers
{
    [GraphRoute("contractors")]
    public class ContractorsController : AppControllerBase
    {
        private readonly IContractorsServices _services;

        public ContractorsController(IContractorsServices services, IMapper mapper) : base(mapper)
        {
            _services = services;
        }

        [Mutation("createContractor", typeof(ContractorsType))]
        public Task<IGraphActionResult> CreateContractor(ContractorsInputType contractor) =>
            ValidateInputModel(() =>
            {
                var model = Mapper.Map<Contractors>(contractor);
                return _services.CreateContractorAsync(model, contractor.Password)
                    .MapAsync(Resolve);
            });

        [Query("getContractorById", typeof(ContractorsType))]
        public Task<IGraphActionResult> GetContractorById(Guid id, Guid? companyId = null) =>
            ValidateInputModel(() => _services.GetContractorByIdAsync(id, companyId).MapAsync(Resolve));

        [Query("getContractorsByCompany", typeof(List<ContractorsType>))]
        public Task<IGraphActionResult> GetContractorsByCompany(Guid companyId, StatusTypeEnum? status = null) =>
            ValidateInputModel(() => _services.GetContractorsByCompanyAsync(companyId, status).MapAsync(Resolve));

        [Mutation("updateContractor", typeof(ContractorsType))]
        public Task<IGraphActionResult> UpdateContractor(ContractorsInputType contractor) =>
            ValidateInputModel(() =>
            {
                var model = Mapper.Map<Contractors>(contractor);
                return _services.UpdateContractorAsync(model).MapAsync(Resolve);
            });

        [Mutation("changeContractorStatus", typeof(ContractorsType))]
        public Task<IGraphActionResult> ChangeContractorStatus(Guid id, Guid? companyId, StatusTypeEnum status) =>
            ValidateInputModel(() => _services.ChangeContractorStatusAsync(id, companyId, status).MapAsync(Resolve));
    }
}
