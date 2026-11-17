using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Infraestructure.Common.Entities
{
    public class Contractors
    {
        public Guid Id { get; set; }
        public Users User { get; set; }
        public Companies Company { get; set; }
        public string Speciality { get; set; }
        public string Phone { get; set; }
        public StatusTypeEnum Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
