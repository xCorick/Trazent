using Trazent.Infraestructure.Common.Entities;

namespace Trazent.Core.Infraestructure.Repositories
{
    public interface ISitesRepository : IRepositoryBase
    {
        Task<Guid> CreateSiteAsync(Sites site);
        Task<List<Sites>> GetAllSitesAsync();
        Task<List<Sites>> GetSitesByCompanyAsync(Guid companyId, bool? isActive = null);
        Task<List<Sites>> GetSitesByUserAsync(Guid userId);
        Task<Sites?> GetSiteByIdAsync(Guid id, Guid? companyId = null);
        Task<Sites?> UpdateSiteAsync(Sites site);
        Task<Sites?> ChangeSiteStatusByIdAsync(Guid id);
        Task<List<SiteAssignments>> GetSiteAssignmentsBySiteAsync(Guid siteId, Guid? companyId = null);
        Task<Guid> AssignUserToSiteAsync(Guid siteId, Guid userId, Guid assignedById, Guid? companyId = null);
        Task<bool> UnassignUserFromSiteAsync(Guid siteId, Guid userId, Guid? companyId = null);
    }
}
