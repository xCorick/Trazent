using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Infraestructure.Common.Entities
{
    public class DeviceTokens
    {
        public Guid Id { get; set; }
        public Users User { get; set; }
        public string Token { get; set; }
        public PlatformTypeEnum Platform { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastSeenAt { get; set; }

    }
}
