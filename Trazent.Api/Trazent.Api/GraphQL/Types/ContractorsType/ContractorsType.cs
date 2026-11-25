using GraphQL.AspNet.Attributes;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Api.GraphQL.Types.ContractorsType
{
    [GraphType("contractorsType")]
    public class ContractorsType
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid CompanyId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Specialty { get; set; }
        public StatusTypeEnum ContractorStatus { get; set; }
        public StatusTypeEnum UserStatus { get; set; }
        public int AssignedSites { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
