using AutoMapper;
using Trazent.Api.GraphQL.Types.ContractorsType;
using Trazent.Infraestructure.Common.Entities;

namespace Trazent.Api.GraphQL.Mapping;

public sealed class ContractorsMappingProfile : Profile
{
    public ContractorsMappingProfile()
    {
        CreateMap<Contractors, ContractorsType>()
            .ForMember(d => d.UserId, o => o.MapFrom(s => s.User.Id))
            .ForMember(d => d.CompanyId, o => o.MapFrom(s => s.Company.Id))
            .ForMember(d => d.FullName, o => o.MapFrom(s => s.User.FullName))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email))
            .ForMember(d => d.Specialty, o => o.MapFrom(s => s.Speciality))
            .ForMember(d => d.ContractorStatus, o => o.MapFrom(s => s.Status))
            .ForMember(d => d.UserStatus, o => o.MapFrom(s => s.User.Status));
        CreateMap<ContractorsInputType, Contractors>()
            .ForMember(d => d.Speciality, o => o.MapFrom(s => s.Specialty))
            .ForMember(d => d.User, o => o.MapFrom(s => new Users
            {
                FullName = s.FullName,
                Email = s.Email,
                Username = s.UserName,
                PhoneNumber = s.Phone,
                Company = new Companies { Id = s.CompanyId }
            }))
            .ForMember(d => d.Company, o => o.MapFrom(s => new Companies { Id = s.CompanyId }));
    }
}
