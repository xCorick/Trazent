
namespace Trazent.Api.GraphQL.Types.SitesType
{

    public class SitesInputType
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string Name { get; set; }
        public string? Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int RadiusMeter { get; set; } = 100;
    }
}
