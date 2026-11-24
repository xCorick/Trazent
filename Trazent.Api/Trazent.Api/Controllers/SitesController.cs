using AutoMapper;
using GraphQL.AspNet.Attributes;
using GraphQL.AspNet.Interfaces.Controllers;
using Trazent.Api.GraphQL.Types.SitesType;
using Trazent.Core.Infraestructure.Services;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Extensions;

namespace Trazent.Api.Controllers
{
    [GraphRoute("sites")]
    public class SitesController : AppControllerBase
    {
        private readonly ISitesServices _services;

        public SitesController(ISitesServices services, IMapper mapper) : base(mapper)
        {
            _services = services;
        }

        [Mutation("creatSite", typeof(SitesType))]
        public Task<IGraphActionResult> CreateSite(SitesInputType site) =>
            ValidateInputModel(() =>
            {
                var model = Mapper.Map<Sites>(site);
                return _services.CreateSiteAsync(model).MapAsync(Resolve);
            });

        [Query("getAllSites", typeof(List<SitesType>))]
        public Task<IGraphActionResult> GetAllSites() =>
            ValidateInputModel(() => _services.GetAllSitesAsync().MapAsync(Resolve));

        [Query("getSitesByCompany", typeof(List<SitesType>))]
        public Task<IGraphActionResult> GetSitesByCompany(Guid companyId, bool? isActive = null) =>
            ValidateInputModel(() => _services.GetSitesByCompanyAsync(companyId, isActive).MapAsync(Resolve));

        [Query("getSitesByUser", typeof(List<SitesType>))]
        public Task<IGraphActionResult> GetSitesByUser(Guid userId) =>
            ValidateInputModel(() => _services.GetSitesByUserAsync(userId).MapAsync(Resolve));

        [Query("getSiteById", typeof(SitesType))]
        public Task<IGraphActionResult> GetSiteById(Guid id, Guid? companyId = null) =>
            ValidateInputModel(() => _services.GetSiteByIdAsync(id, companyId).MapAsync(Resolve));

        [Mutation("updateSite", typeof(SitesType))]
        public Task<IGraphActionResult> UpdateSite(SitesInputType site) =>
            ValidateInputModel(() =>
            {
                var model = Mapper.Map<Sites>(site);
                return _services.UpdateSiteAsync(model).MapAsync(Resolve);
            });

        [Mutation("changeSiteStatusById", typeof(SitesType))]
        public Task<IGraphActionResult> ChangeSiteStatusById(Guid id) =>
            ValidateInputModel(() => _services.ChangeSiteStatusByIdAsync(id).MapAsync(Resolve));

        [Query("getSiteAssignmentsBySite", typeof(List<SiteAssignmentType>))]
        public Task<IGraphActionResult> GetSiteAssignmentsBySite(Guid siteId, Guid? companyId = null) =>
            ValidateInputModel(() => _services.GetSiteAssignmentsBySiteAsync(siteId, companyId).MapAsync(Resolve));

        [Mutation("assignUserToSite", typeof(string))]
        public Task<IGraphActionResult> AssignUserToSite(Guid siteId, Guid userId, Guid assignedById, Guid? companyId = null) =>
            ValidateInputModel(() => _services
                .AssignUserToSiteAsync(siteId, userId, assignedById, companyId)
                .MapAsync(Resolve));

        [Mutation("unassignUserFromSite", typeof(string))]
        public Task<IGraphActionResult> UnassignUserFromSite(Guid siteId, Guid userId, Guid? companyId = null) =>
            ValidateInputModel(() => _services
                .UnassignUserFromSiteAsync(siteId, userId, companyId)
                .MapAsync(Resolve));
    }
}
