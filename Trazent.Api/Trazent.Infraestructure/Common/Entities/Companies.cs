using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Infraestructure.Common.Entities
{
    public class Companies
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public PlanTypeEnum Plan { get; set; }
        public bool? IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
