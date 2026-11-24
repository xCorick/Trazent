using AutoMapper;
using Trazent.Api.GraphQL.Types.SitesType;
using Trazent.Infraestructure.Common.Entities;

namespace Trazent.Api.GraphQL.Mapping
{
    public class SitesMappingProfile : Profile
    {
        public SitesMappingProfile()
        {
            CreateMap<Sites, SitesType>();
            CreateMap<SitesInputType, Sites>()
                .ForMember(destination => destination.Company,
                    options => options.MapFrom(source => new Companies { Id = source.CompanyId }));
            CreateMap<SiteAssignments, SiteAssignmentType>()
                .ForMember(destination => destination.SiteId,
                    options => options.MapFrom(source => source.Site.Id))
                .ForMember(destination => destination.UserId,
                    options => options.MapFrom(source => source.User.Id))
                .ForMember(destination => destination.FullName,
                    options => options.MapFrom(source => source.User.FullName))
                .ForMember(destination => destination.Email,
                    options => options.MapFrom(source => source.User.Email))
                .ForMember(destination => destination.UserStatus,
                    options => options.MapFrom(source => source.User.Status));
        }
    }
}
