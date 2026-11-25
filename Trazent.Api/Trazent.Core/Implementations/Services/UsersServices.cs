using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Api.Core.Implementations.Repositories;
using Trazent.Api.DataAccess;
using Trazent.Core.Infraestructure.Services;
using Trazent.Infraestructure.Common.Constants;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;
using Trazent.Infraestructure.Common.Extensions;
using Trazent.Infraestructure.Models;
using Trazent.Infraestructure.Models.Exceptions;

namespace Trazent.Core.Implementations.Services
{
    public class UsersServices : IUsersServices
    {
        private readonly IAppDbContext _dbContext;
        private readonly ICoreUnitRepositories _coreUnitRepositories;
        public UsersServices(IAppDbContext dbContext, ICoreUnitRepositories coreUnitRepositories)
        {
            _dbContext = dbContext;
            _coreUnitRepositories = coreUnitRepositories;
        }

        #region CreateUserAsync
        public async Task<IResult<Users>> CreateUserAsync(Users user)
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();

                _coreUnitRepositories.SetConnection(
                    _dbContext.Connection,
                    _dbContext.Transaction);

                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _coreUnitRepositories.SetConnection(
                        _dbContext.Connection,
                        _dbContext.Transaction);

                    string newId = await _coreUnitRepositories
                        .UsersRepository
                        .CreateUserAsync(user);

                    if (Guid.TryParse(newId, out Guid id))
                        user.Id = id;
                });

                return Result.Success(user);
            }
            catch (ApiException ex)
            {
                return Result.Failed<Users>(ex.ToError());
            }
        }
        #endregion
        #region GetUserById
        public async Task<IResult<Users>> GetUserById(Guid id)
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();

                _coreUnitRepositories.SetConnection(
                    _dbContext.Connection,
                    _dbContext.Transaction);

                return await _coreUnitRepositories.UsersRepository
                    .GetUserById(id)
                    .MapAsync(Result.Success);
            }
            catch (ApiException ex)
            {
                return Result.Failed<Users>(ex.ToError());
            }
        }
        #endregion
        #region GetUsersByCompany
        public async Task<IResult<List<Users>>> GetUsersByCompany(
            Guid companyId,
            RoleTypeEnum? role = null,
            StatusTypeEnum? status = null)
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();

                _coreUnitRepositories.SetConnection(
                    _dbContext.Connection,
                    _dbContext.Transaction);

                return await _coreUnitRepositories.UsersRepository
                    .GetUsersByCompany(companyId, role, status)
                    .MapAsync(Result.Success);
            }
            catch (ApiException ex)
            {
                return Result.Failed<List<Users>>(ex.ToError());
            }
        }
        #endregion
        #region UpdateUserByIdAsync
        public async Task<IResult<Users>> UpdateUserByIdAsync(Users user)
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();

                _coreUnitRepositories.SetConnection(
                    _dbContext.Connection,
                    _dbContext.Transaction);

                await _dbContext.ExecuteInTransactionAsync(async () => 
                {
                    _coreUnitRepositories.SetConnection(
                        _dbContext.Connection,
                        _dbContext.Transaction);

                    await _coreUnitRepositories.UsersRepository
                        .UpdateUserByIdAsync(user);
                });

                return Result.Success(user);
            }
            catch (ApiException ex)
            {
                return Result.Failed<Users>(ex.ToError());
            }
        }
        #endregion
        #region ChangeIsActiveAsync
        public async Task<IResult<Users>> ChangeIsActiveAsync(Guid userId, Guid companyId, StatusTypeEnum status)
        {
            try
            {
                await _dbContext.EnsureConnectionAsync();

                _coreUnitRepositories.SetConnection(
                    _dbContext.Connection,
                    _dbContext.Transaction);

                Users? user = await _coreUnitRepositories.UsersRepository
                    .GetUserById(userId);

                if (user == null || user.Company.Id != companyId)
                    throw new ApiException(ErrorCodes.NotFoundElement);

                await _dbContext.ExecuteInTransactionAsync(async () =>
                {
                    _coreUnitRepositories.SetConnection(
                        _dbContext.Connection,
                        _dbContext.Transaction);

                    await _coreUnitRepositories.UsersRepository
                        .ChangeIsActiveAsync(userId, companyId, status);
                });

                user.Status = status;

                return Result.Success(user);
            }
            catch (ApiException ex)
            {
                return Result.Failed<Users>(ex.ToError());
            }
        }
        #endregion
    }
}