using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;
using Trazent.Infraestructure.Models;

namespace Trazent.Core.Infraestructure.Services
{
    public interface IUsersServices
    {
        Task<IResult<Users>> CreateUserAsync(Users user);
        Task<IResult<Users>> GetUserById(Guid id);
        Task<IResult<List<Users>>> GetUsersByCompany(Guid companyId, RoleTypeEnum? role = null,StatusTypeEnum? status = null);
        Task<IResult<Users>> UpdateUserByIdAsync(Users user);
        Task<IResult<Users>> ChangeIsActiveAsync( Guid userId, Guid companyId, StatusTypeEnum status);
    }
}

