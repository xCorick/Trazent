using AutoMapper;
using GraphQL.AspNet.Attributes;
using GraphQL.AspNet.Interfaces.Controllers;
using Trazent.Api.GraphQL.Types.CompaniesType;
using Trazent.Core.Infraestructure.Services;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Extensions;

namespace Trazent.Api.Controllers
{
    [GraphRoute("companies")]
    public class CompaniesController : AppControllerBase
    {
        private readonly ICompaniesServices _services;

        public CompaniesController(ICompaniesServices services, IMapper mapper) : base(mapper)
        {
            _services = services;
        }

        [Mutation("createCompany", typeof(CompaniesType))]
        public Task<IGraphActionResult> CreateCompanyAsync(CompaniesInputType company) =>
            ValidateInputModel(() =>
            {
                var model = Mapper.Map<Companies>(company);
                return _services
                .CreateCompanyAsync(model)
                .MapAsync(Resolve);
            });

        [Query("getCompanyByIdAsync", typeof(CompaniesType))]
        public Task<IGraphActionResult> GetCompanyByIdAsync(Guid id) =>
       ValidateInputModel(() =>
       {
           return _services
           .GetCompanyById(id)
           .MapAsync(Resolve);
       });

        [Query("getAllCompanies", typeof(List<CompaniesType>))]
        public Task<IGraphActionResult> GetAllCompaniesAsync() =>
            ValidateInputModel(() =>
            {
                return _services
                .GetAllComaniesAsync()
                .MapAsync(Resolve);

            });

        [Mutation("updateCompany", typeof(CompaniesType))]
        public Task<IGraphActionResult> UpdateCompanyAsync(CompaniesInputType company) =>
            ValidateInputModel(() =>
            {
                var model = Mapper.Map<Companies>(company);
                return _services
                .UpdateCompanyAsync(model)
                .MapAsync(Resolve);
            });

        [Mutation("ChangeStatusById", typeof(CompaniesType))]
        public Task<IGraphActionResult> ChangeCompanyStatusByIdAsync(Guid id) =>
            ValidateInputModel(() =>
            {
                return _services.ChangeStatusById(id).MapAsync(Resolve);
            });
    }
}
