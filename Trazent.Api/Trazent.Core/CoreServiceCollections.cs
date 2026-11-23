using Microsoft.Extensions.DependencyInjection;
using Trazent.Api.Core.Implementations.Repositories;
using Trazent.Api.Core.Implementations.Services;
using Trazent.Api.Core.Infraestructure.Repositories;
using Trazent.Api.DataAccess;
using Trazent.Core.Infraestructure.Services;

namespace Trazent.Core;

public static class CoreServiceCollections
{
    public static void RegisterCoreServices(this IServiceCollection services)
    {
        RegisterRepositories(services);
        RegisterServices(services);
    }

    private static void RegisterRepositories(this IServiceCollection services)
    {
        services.AddScoped<IAppDbContext, AppDbContext>();
        services.AddScoped<ICoreUnitRepositories, CoreUnitRepositories>();
        services.AddScoped<ICompaniesRepository, CompaniesRepository>();
    }

    private static void RegisterServices(this IServiceCollection services)
    {
        services.AddScoped<ICompaniesServices, CompaniesServices>();
    }
}
