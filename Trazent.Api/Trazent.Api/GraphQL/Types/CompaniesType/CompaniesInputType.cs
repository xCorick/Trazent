using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Api.GraphQL.Types.CompaniesType
{
    public class CompaniesInputType
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public PlanTypeEnum? Plan { get; set; }
        public bool? IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
