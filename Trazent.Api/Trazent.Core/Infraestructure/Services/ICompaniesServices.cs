using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Models;

namespace Trazent.Core.Infraestructure.Services
{
    public interface ICompaniesServices
    {
        Task<IResult<Companies>> CreateCompanyAsync(Companies company);
        Task<IResult<List<Companies>>> GetAllComaniesAsync();
        Task<IResult<Companies>> UpdateCompanyAsync(Companies company); 
        Task<IResult<Companies>> GetCompanyById(Guid id, bool? isActive = true);
        Task<IResult<Companies>> ChangeStatusById(Guid id);
    }
}
