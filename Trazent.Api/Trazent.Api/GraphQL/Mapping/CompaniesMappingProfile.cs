using AutoMapper;
using Trazent.Api.GraphQL.Types.CompaniesType;
using Trazent.Infraestructure.Common.Entities;

namespace Trazent.Api.GraphQL.Mapping;

public sealed class CompaniesMappingProfile : Profile
{
    public CompaniesMappingProfile()
    {
        CreateMap<Companies, CompaniesType>();
        CreateMap<CompaniesInputType, Companies>();
    }
}
