using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Infraestructure.Common.Entities
{
    public class Users
    {
        public Guid Id { get; set; }

        public Companies Company { get; set; }
        public string FullName { get; set; }
        public RoleTypeEnum Role { get; set; }
        public StatusTypeEnum Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string SecurityStamp { get; set; }
        public string ConcurrencyStamp { get; set; }
        public string PhoneNumber { get; set; }
        public string LockoutEnd { get; set; }
        public int AccessFailedCount { get; set; }
        public DateTime CreatedAd { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
