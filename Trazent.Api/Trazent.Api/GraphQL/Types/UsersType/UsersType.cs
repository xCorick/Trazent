using GraphQL.AspNet.Attributes;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Api.GraphQL.Types.UsersType
{
    [GraphType("usersType")]
    public class UsersType
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string FullName { get; set; }
        public RoleTypeEnum Role { get; set; }
        public StatusTypeEnum Status { get; set; }
        public bool IsActive { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? LockoutEnd { get; set; }
        public int AccessFailedCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
