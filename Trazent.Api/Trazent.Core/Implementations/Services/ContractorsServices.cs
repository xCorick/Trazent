using Microsoft.AspNetCore.Identity;
using Trazent.Api.Core.Implementations.Repositories;
using Trazent.Api.DataAccess;
using Trazent.Core.Infraestructure.Repositories;
using Trazent.Core.Infraestructure.Services;
using Trazent.Infraestructure.Common.Constants;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;
using Trazent.Infraestructure.Models;
using Trazent.Infraestructure.Models.Exceptions;

namespace Trazent.Core.Implementations.Services;

public class ContractorsServices : IContractorsServices
{
    private readonly IAppDbContext _dbContext;
    private readonly ICoreUnitRepositories _repositories;
    private readonly PasswordHasher<Users> _passwordHasher = new();

    public ContractorsServices(IAppDbContext dbContext, ICoreUnitRepositories repositories)
    {
        _dbContext = dbContext;
        _repositories = repositories;
    }

    private async Task<IContractorsRepository> GetRepositoryAsync()
    {
        await _dbContext.EnsureConnectionAsync();
        _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
        return _repositories.ContractorsRepository;
    }

    public async Task<IResult<Contractors>> CreateContractorAsync(Contractors contractor, string? password)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ApiException(ErrorCodes.PasswordIsRequired, nameof(password));

            var repository = await GetRepositoryAsync();

            Contractors? created = null;

            await _dbContext.ExecuteInTransactionAsync(async () =>
            {
                _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                var securityStamp = Guid.NewGuid().ToString("N");
                var concurrencyStamp = Guid.NewGuid().ToString("N");
                var passwordHash = _passwordHasher.HashPassword(contractor.User, password);
                created = await repository.CreateContractorAsync(contractor, passwordHash, securityStamp, concurrencyStamp);
            });

            if (created is null) throw new ApiException(ErrorCodes.NotFoundElement);

            return Result.Success(created);
        }
        catch (ApiException ex) 
        { 
            return Result.Failed<Contractors>(ex.ToError()); 
        }
    }

    public async Task<IResult<Contractors>> GetContractorByIdAsync(Guid id, Guid? companyId = null)
    {
        try
        {
            var contractor = await (await GetRepositoryAsync())
                .GetContractorByIdAsync(id, companyId);

            if (contractor is null) 
                throw new ApiException(ErrorCodes.NotFoundElement);

            return Result.Success(contractor);
        }
        catch (ApiException ex) 
        { 
            return Result.Failed<Contractors>(ex.ToError()); 
        }
    }

    public async Task<IResult<List<Contractors>>> GetContractorsByCompanyAsync(Guid companyId, StatusTypeEnum? status = null)
    {
        try
        {
            var contractors = await (await GetRepositoryAsync())
                .GetContractorsByCompanyAsync(companyId, status is null ? null : (short)status.Value);

            return Result.Success(contractors);
        }
        catch (ApiException ex) 
        { 
            return Result.Failed<List<Contractors>>(ex.ToError()); 
        }
    }

    public async Task<IResult<Contractors>> UpdateContractorAsync(Contractors contractor)
    {
        try
        {
            var repository = await GetRepositoryAsync();

            Contractors? updated = null;

            await _dbContext.ExecuteInTransactionAsync(async () =>
            {
                _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                updated = await repository.UpdateContractorAsync(contractor);
            });

            if (updated is null) 
                throw new ApiException(ErrorCodes.NotFoundElement);

            return Result.Success(updated);
        }
        catch (ApiException ex) 
        {
            return Result.Failed<Contractors>(ex.ToError()); 
        }
    }

    public async Task<IResult<Contractors>> ChangeContractorStatusAsync(Guid id, Guid? companyId, StatusTypeEnum status)
    {
        try
        {
            var repository = await GetRepositoryAsync();

            Contractors? updated = null;

            await _dbContext.ExecuteInTransactionAsync(async () =>
            {
                _repositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                updated = await repository.ChangeContractorStatusAsync(id, companyId, (short)status);
            });

            if (updated is null) 
                throw new ApiException(ErrorCodes.NotFoundElement);

            return Result.Success(updated);
        }
        catch (ApiException ex)
        { 
            return Result.Failed<Contractors>(ex.ToError()); 
        }
    }
}
