using GraphQL.AspNet.Attributes;

namespace Trazent.Api.GraphQL.Types.SitesType
{
    [GraphType("sitesType")]
    public class SitesType
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int RadiusMeter { get; set; }
        public bool IsActive { get; set; }
        public int AssignedContractors { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
