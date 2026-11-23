using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Api.Core.Implementations.Repositories;
using Trazent.Api.DataAccess;
using Trazent.Core.Infraestructure.Services;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Extensions;
using Trazent.Infraestructure.Models;
using Trazent.Infraestructure.Models.Exceptions;

namespace Trazent.Api.Core.Implementations.Services
{
    public class CompaniesServices : ICompaniesServices
    {
        private readonly IAppDbContext _dbContext;
        private readonly ICoreUnitRepositories _coreUnitRepositories;
        public CompaniesServices(IAppDbContext dbContext, ICoreUnitRepositories coreUnitRepositories)
        {
            _dbContext = dbContext;
            _coreUnitRepositories = coreUnitRepositories;
        }

        public async Task<IResult<Companies>>CreateCompanyAsync(Companies company)
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();
                _coreUnitRepositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);

                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _coreUnitRepositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                    string newId = await _coreUnitRepositories
                      .CompaniesRepository
                      .CreateCompanyAsync(company);
                });
                return Result.Success(company);
            }
            catch(ApiException ex)
            {
                return Result.Failed<Companies>(ex.ToError());
            }
        }

        public async Task<IResult<List<Companies>>> GetAllComaniesAsync()
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();
                _coreUnitRepositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);

                return await _coreUnitRepositories.CompaniesRepository
                    .GetAlltCompaniesAsync()
                    .MapAsync(Result.Success);
            }
            catch(ApiException ex)
            {
                return Result.Failed<List<Companies>>(ex.ToError());
            }
        }

        public async Task<IResult<Companies>> GetCompanyById(Guid id, bool? isActive = null)
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();
                _coreUnitRepositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);

                return await _coreUnitRepositories.CompaniesRepository
                    .GetCompanyById(id)
                    .MapAsync(Result.Success);
            }
            catch (ApiException ex)
            {
                return Result.Failed<Companies>(ex.ToError());
            }
        }

        public async Task<IResult<Companies>>UpdateCompanyAsync(Companies company)
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();
                _coreUnitRepositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);

                Companies update = await _coreUnitRepositories.CompaniesRepository.GetCompanyById(company.Id, true);

                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _coreUnitRepositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                    await _coreUnitRepositories.CompaniesRepository.UpdateCompaniesAsync(company);
                });

                return Result.Success(company);

            } catch(ApiException ex)
            {
                return Result.Failed<Companies>(ex.ToError());
            }
        }

        public async Task<IResult<Companies>> ChangeStatusById(Guid id)
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();
                _coreUnitRepositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);

                Companies? company = await _coreUnitRepositories.CompaniesRepository.GetCompanyById(id,null);

                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _coreUnitRepositories.SetConnection(_dbContext.Connection, _dbContext.Transaction);
                    var status = await _coreUnitRepositories.CompaniesRepository.ChangeIsActiveByIdAsync(id);
                });

                company.IsActive = !company.IsActive;

                return Result.Success(company); 
            }catch(ApiException ex)
            {
                return Result.Failed<Companies>(ex.ToError());
            }
        }
    }
}
