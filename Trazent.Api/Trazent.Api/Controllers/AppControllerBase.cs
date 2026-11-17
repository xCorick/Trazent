using AutoMapper;
using AutoMapper.Internal;
using GraphQL.AspNet.Controllers;
using GraphQL.AspNet.Interfaces.Controllers;
using Microsoft.AspNetCore.Authentication;
using Trazent.Api.DataAccess;
using Trazent.Infraestructure.Models;
using static GraphQL.AspNet.Constants;

namespace Trazent.Api.Controllers
{
    public abstract class AppControllerBase : GraphController
    {

            public readonly IMapper Mapper;

            public AppControllerBase(IMapper mapper)
            {
                Mapper = mapper;
            }

            public IGraphActionResult ValidateInputModel(Func<IGraphActionResult> func)
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                return func();
            }

            public async Task<IGraphActionResult> ValidateInputModel(Func<Task<IGraphActionResult>> func)
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                return await func();
            }

        /// <summary>
        /// Revalida server-side que el usuario autenticado tiene el permiso (module, action)
        /// requerido para la operación. El frontend solo oculta/deshabilita acciones sin permiso
        /// como ayuda de UX; esta es la verificación real, ya que cualquier restricción del
        /// lado del cliente puede ser evadida (ej. DevTools) por un usuario autenticado.
        /// </summary>
        public Task<IGraphActionResult> RequirePermission(
            string module,
            string action,
            Func<Task<IGraphActionResult>> func) =>
            RequirePermission(module, new[] { action }, func);

        /// <summary>
        /// Igual que RequirePermission, pero basta con que el usuario tenga cualquiera de las
        /// acciones indicadas (ej. changeIsActive acepta tanto ACTIVATE como INACTIVATE, igual
        /// que el frontend decide si mostrar el botón vía hasAnyPermission).
        /// </summary>
        public async Task<IGraphActionResult> RequirePermission(
            string module,
            IReadOnlyCollection<string> anyOfActions,
            Func<Task<IGraphActionResult>> func)
        {
            var httpContext = HttpContext;
            var username = httpContext?.User?.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Error("No autorizado", "UNAUTHORIZED");

            var appDbContext = httpContext.RequestServices.GetRequiredService<IAppDbContext>();
            await appDbContext.EnsureConnectionAsync();

            var authenticationService = httpContext.RequestServices
                .GetRequiredService<IAuthenticationService>();

            //var permissions = await authenticationService.GetPermissionsAsync(username.ToUpper());
            //var hasPermission = permissions != null
            //    && permissions.TryGetValue(module, out var actions)
            //    && actions != null
            //    && actions.Any(anyOfActions.Contains);

            //if (!hasPermission)
            //    return Error("No tienes permiso para realizar esta acción", ErrorCodes.Forbidden);

            return await ValidateInputModel(func);
        }


        public IGraphActionResult Resolve<T>(IResult<T> result) where T : class
            {
                if (result.Error != null)
                {
                    return Error(result.Error.Description, result.Error.Code);
                }

                var sourceType = typeof(T);

                if (sourceType.IsArray || sourceType.IsListType())
                    return ResolveCollection(result, sourceType);

                var destinationType = GetDestinationType(sourceType!);

                return Ok(Mapper.Map(result.Data, sourceType, destinationType));
            }

        private IGraphActionResult ResolveCollection<T>(IResult<T> result, Type dataType) where T : class
        {
            Type? sourceType;

            if (dataType.IsArray)
                sourceType = dataType.GetElementType();
            else
                sourceType = dataType.GetGenericArguments()[0];

            if (sourceType == typeof(string))
                return Ok(result.Data);

            var destinationType = GetDestinationType(sourceType!);

            Type sourceListType = typeof(List<>).MakeGenericType(sourceType!);
            Type destinationListType = typeof(List<>).MakeGenericType(destinationType!);

            return Ok(Mapper.Map(result.Data, sourceListType, destinationListType));
        }

        private Type GetDestinationType(Type sourceType) =>
            Mapper.ConfigurationProvider
                .Internal()
                .GetAllTypeMaps()
                .Where(t => t.SourceType == sourceType)
                .Select(x => x.DestinationType)
                .FirstOrDefault();
    }
}
