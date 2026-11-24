using AutoMapper;
using Trazent.Api.GraphQL.Types.CompaniesType;
using Trazent.Api.GraphQL.Types.UsersType;
using Trazent.Infraestructure.Common.Entities;

namespace Trazent.Api.GraphQL.Mapping
{
    public class UsersMappingProfile : Profile
    {
        public UsersMappingProfile()
        {
            CreateMap<Users, UsersType>()
                .ForMember(destination => destination.CompanyId,
                    options => options.MapFrom(source => source.Company.Id));

            CreateMap<UsersInputType, Users>()
                .ForMember(destination => destination.Company,
                    options => options.MapFrom(source => new Companies { Id = source.CompanyId }));
        }
    }
}
    
