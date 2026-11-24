using Trazent.Api.Core.Implementations.Repositories;
using Trazent.Api.DataAccess;
using Trazent.Core.Infraestructure.Repositories;
using Trazent.Core.Infraestructure.Services;
using Trazent.Infraestructure.Common.Constants;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Extensions;
using Trazent.Infraestructure.Models;
using Trazent.Infraestructure.Models.Exceptions;

namespace Trazent.Core.Implementations.Services
{
    public class SitesServices : ISitesServices
    {
        private readonly IAppDbContext _dbContext;
        private readonly ICoreUnitRepositories _repositories;

        public SitesServices(IAppDbContext dbContext, ICoreUnitRepositories repositories)
        {
            _dbContext = dbContext;
            _repositories = repositories;
        }

        private async Task<ISitesRepository> GetRepositoryAsync()
        {
            await _dbContext.EnsureConnectionAsync();
            _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
            return _repositories.SitesRepository;
        }

        public async Task<IResult<Sites>> CreateSiteAsync(Sites site)
        {
            try
            {
                var repository = await GetRepositoryAsync();
                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                    site.Id = await repository.CreateSiteAsync(site);
                });
                return Result.Success(site);
            }
            catch (ApiException ex) { return Result.Failed<Sites>(ex.ToError()); }
        }

        public async Task<IResult<List<Sites>>> GetAllSitesAsync()
        {
            try { return await (await GetRepositoryAsync()).GetAllSitesAsync().MapAsync(Result.Success); }
            catch (ApiException ex) { return Result.Failed<List<Sites>>(ex.ToError()); }
        }

        public async Task<IResult<List<Sites>>> GetSitesByCompanyAsync(Guid companyId, bool? isActive = null)
        {
            try { return await (await GetRepositoryAsync()).GetSitesByCompanyAsync(companyId, isActive).MapAsync(Result.Success); }
            catch (ApiException ex) { return Result.Failed<List<Sites>>(ex.ToError()); }
        }

        public async Task<IResult<List<Sites>>> GetSitesByUserAsync(Guid userId)
        {
            try { return await (await GetRepositoryAsync()).GetSitesByUserAsync(userId).MapAsync(Result.Success); }
            catch (ApiException ex) { return Result.Failed<List<Sites>>(ex.ToError()); }
        }

        public async Task<IResult<Sites>> GetSiteByIdAsync(Guid id, Guid? companyId = null)
        {
            try
            {
                var site = await (await GetRepositoryAsync()).GetSiteByIdAsync(id, companyId);
                if (site is null)
                    throw new ApiException(ErrorCodes.SiteNotFound);
                return Result.Success(site);
            }
            catch (ApiException ex) { return Result.Failed<Sites>(ex.ToError()); }
        }

        public async Task<IResult<Sites>> UpdateSiteAsync(Sites site)
        {
            try
            {
                var repository = await GetRepositoryAsync();
                Sites? updated = null;
                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                    updated = await repository.UpdateSiteAsync(site);
                });
                if (updated is null)
                    throw new ApiException(ErrorCodes.SiteNotFound);
                return Result.Success(updated);
            }
            catch (ApiException ex) { return Result.Failed<Sites>(ex.ToError()); }
        }

        public async Task<IResult<Sites>> ChangeSiteStatusByIdAsync(Guid id)
        {
            try
            {
                var repository = await GetRepositoryAsync();
                Sites? site = null;
                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                    site = await repository.ChangeSiteStatusByIdAsync(id);
                });
                if (site is null)
                    throw new ApiException(ErrorCodes.SiteNotFound);
                return Result.Success(site);
            }
            catch (ApiException ex) { return Result.Failed<Sites>(ex.ToError()); }
        }

        public async Task<IResult<List<SiteAssignments>>> GetSiteAssignmentsBySiteAsync(Guid siteId, Guid? companyId = null)
        {
            try 
            { 
                return await (
                    await GetRepositoryAsync())
                    .GetSiteAssignmentsBySiteAsync(siteId, companyId)
                    .MapAsync(Result.Success); 
            }
            catch (ApiException ex) { 
                return Result.Failed<List<SiteAssignments>>(ex.ToError()); 
            }
        }

        public async Task<IResult<string>> AssignUserToSiteAsync(Guid siteId, Guid userId, Guid assignedById, Guid? companyId = null)
        {
            try
            {
                var repository = await GetRepositoryAsync();
                Guid assignmentId = Guid.Empty;
                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                    assignmentId = await repository.AssignUserToSiteAsync(siteId, userId, assignedById, companyId);
                });
                return Result.Success(assignmentId.ToString());
            }
            catch (ApiException ex) { return Result.Failed<string>(ex.ToError()); }
        }

        public async Task<IResult<string>> UnassignUserFromSiteAsync(Guid siteId, Guid userId, Guid? companyId = null)
        {
            try
            {
                var repository = await GetRepositoryAsync();
                var removed = false;
                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                    removed = await repository.UnassignUserFromSiteAsync(siteId, userId, companyId);
                });
                return Result.Success(removed.ToString().ToLowerInvariant());
            }
            catch (ApiException ex) { 
                return Result.Failed<string>(ex.ToError()); 
            }
        }
    }
}
