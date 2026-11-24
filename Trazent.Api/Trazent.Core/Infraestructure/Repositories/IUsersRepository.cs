using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Core.Infraestructure.Repositories
{
    public interface IUsersRepository : IRepositoryBase
    {
        Task<string> CreateUserAsync(Users user);
        Task<Users?> GetUserById(Guid id);
        Task<List<Users>> GetUsersByCompany(Guid companyId, RoleTypeEnum? role = null, StatusTypeEnum? status = null);
        Task UpdateUserByIdAsync(Users user);
        Task<bool> ChangeIsActiveAsync(Guid userId, Guid companyId, StatusTypeEnum status);
    }
}
