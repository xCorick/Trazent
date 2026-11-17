using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Infraestructure.Common.Entities
{
    public class Evidence
    {
        public Guid Id { get; set; }
        public Guid CliendId { get; set; }
        public Companies Company { get; set; }
        public Tasks Task { get; set; }
        public Users User { get; set; }
        public string FileKey { get; set; }
        public string Comment { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime CapturedAtDevice { get; set; }
        public DateTime UploadedAt { get; set; }
        public ReviewStatusTypeEnum ReviewStatus { get; set; }
        public Guid ReviewerId { get; set; }
        public string ReviewerComment { get; set; }
        public DateTime ReviewerAt { get; set; }

    }
}
