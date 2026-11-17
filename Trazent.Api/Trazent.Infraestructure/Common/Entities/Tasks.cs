using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Infraestructure.Common.Entities
{
    public class Tasks
    {
        public Guid Id { get; set; }
        public Companies Company { get; set; }
        public Sites Site { get; set; }
        public Guid AssignedToId { get; set; }
        public Guid CreatedById { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DueAt { get; set; }
        public TaskStatusTypeEnum Status { get; set; }
        public DateTime CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
