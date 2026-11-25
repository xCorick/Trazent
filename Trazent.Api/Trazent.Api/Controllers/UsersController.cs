using AutoMapper;
using GraphQL.AspNet.Attributes;
using GraphQL.AspNet.Interfaces.Controllers;
using Microsoft.AspNetCore.Mvc;
using Trazent.Api.GraphQL.Types.UsersType;
using Trazent.Core.Infraestructure.Services;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;
using Trazent.Infraestructure.Common.Extensions;

    namespace Trazent.Api.Controllers
    {
        [GraphRoute("users")]
        public class UsersController : AppControllerBase
        {
            private readonly IUsersServices _services;

            public UsersController(IUsersServices services, IMapper mapper) : base(mapper)
            {
                _services = services;
            }


        [Mutation("createUser", typeof(UsersType))]
        public Task<IGraphActionResult> CreateUserAsync(UsersInputType user) =>
            ValidateInputModel(() =>
            {
                var model = Mapper.Map<Users>(user);

                return _services
                    .CreateUserAsync(model)
                    .MapAsync(Resolve);
            });

        [Mutation("updateUser", typeof(UsersType))]
        public Task<IGraphActionResult> UpdateUserAsync(UsersInputType user) =>
            ValidateInputModel(() =>
            {
                var model = Mapper.Map<Users>(user);

                return _services
                    .UpdateUserByIdAsync(model)
                    .MapAsync(Resolve);
            });

        [Mutation("changeUserStatus", typeof(UsersType))]
        public Task<IGraphActionResult> ChangeUserStatusAsync(Guid userId, Guid companyId, StatusTypeEnum status) =>
            ValidateInputModel(() =>
            {
                return _services
                    .ChangeIsActiveAsync(userId, companyId, status)
                    .MapAsync(Resolve);
            });

        [Query("getUserById", typeof(UsersType))]
        public Task<IGraphActionResult> GetUserByIdAsync(Guid id) =>
            ValidateInputModel(() =>
            {
                return _services
                    .GetUserById(id)
                    .MapAsync(Resolve);
            });

        [Query("getUsersByCompany", typeof(List<UsersType>))]
        public Task<IGraphActionResult> GetUsersByCompanyAsync(Guid companyId, RoleTypeEnum? role = null, StatusTypeEnum? status = null) =>
            ValidateInputModel(() =>
            {
                return _services
                    .GetUsersByCompany(companyId, role, status)
                    .MapAsync(Resolve);
            });
    }
}