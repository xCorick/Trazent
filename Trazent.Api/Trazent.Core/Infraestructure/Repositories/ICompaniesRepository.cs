using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Entities;

namespace Trazent.Api.Core.Infraestructure.Repositories
{
    public interface ICompaniesRepository
    {
        Task<List<Companies>> GetAlltCompaniesAsync();
        Task UpdateCompaniesAsync(Companies company);
        Task<Companies> GetCompanyById(Guid id, bool? isActive = true);
        Task<bool> ChangeIsActiveByIdAsync(Guid id);
        Task<string> CreateCompanyAsync(Companies company);

    }
}
