using System;
using System.Collections.Generic;
using System.Text;

namespace Trazent.Infraestructure.Common.Entities
{
    public class RefreshTokens
    {
        public Guid Id { get; set; }
        public Users User { get; set; }
        public string TokenHash { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime RevokedAt { get; set; }
        public Guid ReplacedById { get; set; }
    }
}
