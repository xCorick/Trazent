using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Models;

namespace Trazent.Core.Infraestructure.Services
{
    public interface ISitesServices
    {
        Task<IResult<Sites>> CreateSiteAsync(Sites site);
        Task<IResult<List<Sites>>> GetAllSitesAsync();
        Task<IResult<List<Sites>>> GetSitesByCompanyAsync(Guid companyId, bool? isActive = null);
        Task<IResult<List<Sites>>> GetSitesByUserAsync(Guid userId);
        Task<IResult<Sites>> GetSiteByIdAsync(Guid id, Guid? companyId = null);
        Task<IResult<Sites>> UpdateSiteAsync(Sites site);
        Task<IResult<Sites>> ChangeSiteStatusByIdAsync(Guid id);
        Task<IResult<List<SiteAssignments>>> GetSiteAssignmentsBySiteAsync(Guid siteId, Guid? companyId = null);
        Task<IResult<string>> AssignUserToSiteAsync(Guid siteId, Guid userId, Guid assignedById, Guid? companyId = null);
        Task<IResult<string>> UnassignUserFromSiteAsync(Guid siteId, Guid userId, Guid? companyId = null);
    }
}
