using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Api.Core.Infraestructure.Repositories;
using Trazent.Core.Infraestructure.Repositories;

namespace Trazent.Api.Core.Implementations.Repositories
{
    public interface ICoreUnitRepositories : IRepositoryBase
    {
        ICompaniesRepository CompaniesRepository { get; }
    }
}
