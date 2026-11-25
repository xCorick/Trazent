using System;
using System.Collections.Generic;
using System.Text;

namespace Trazent.Infraestructure.Common.Entities
{
    public class SiteAssignments
    {
        public Guid Id { get; set; }
        public Sites Site { get; set; }
        public Users User { get; set; }
        public Guid AssignedById { get; set; }
        public string AssignedByName { get; set; }
        public DateTime AssignedAt { get; set; }

    }
}
