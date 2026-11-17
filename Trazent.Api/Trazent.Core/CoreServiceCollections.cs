using Microsoft.Extensions.DependencyInjection;
using Trazent.Api.Core.Implementations.Repositories;
using Trazent.Api.Core.Implementations.Services;
using Trazent.Api.Core.Infraestructure.Repositories;
using Trazent.Api.DataAccess;
using Trazent.Core.Implementations.Services;
using Trazent.Core.Infraestructure.Services;

namespace Trazent.Core;

public static class CoreServiceCollections
{
    public static IServiceCollection AddCoreServices(this IServiceCollection services)
    {
        services.AddScoped<IAppDbContext, AppDbContext>();
        services.AddScoped<ICompaniesServices, CompaniesServices>();
        services.AddScoped<ICoreUnitRepositories, CoreUnitRepositories>();
        services.AddScoped<ICompaniesRepository, CompaniesRepository>();
        return services;
    }

    private static void RegistrarRepositories(this IServiceCollection services)
    {
        services.AddScoped<ICompaniesRepository, CompaniesRepository>();
    }

    private static void RegistrarService(this IServiceCollection services)
    {
        services.AddScoped<ICompaniesServices, CompaniesServices>();
    }


    public static void RegisterHttpClientServices(this IServiceCollection services)
    {
        services.AddHttpClient<IAppSyncEventsService, AppSyncEventsService>();
    }
}
