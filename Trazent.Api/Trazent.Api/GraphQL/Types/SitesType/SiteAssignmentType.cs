using GraphQL.AspNet.Attributes;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Api.GraphQL.Types.SitesType
{
    [GraphType("siteAssignmentType")]
    public class SiteAssignmentType
    {
        public Guid Id { get; set; }
        public Guid SiteId { get; set; }
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public StatusTypeEnum UserStatus { get; set; }
        public Guid AssignedById { get; set; }
        public string AssignedByName { get; set; }
        public DateTime AssignedAt { get; set; }
    }
}
