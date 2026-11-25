using System.ComponentModel.DataAnnotations;

namespace Trazent.Api.GraphQL.Types.ContractorsType
{
    public class ContractorsInputType
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Specialty { get; set; }
    }
}
