using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Api.GraphQL.Types.UsersType
{
    public class UsersInputType
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string FullName { get; set; }
        public RoleTypeEnum Role { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
