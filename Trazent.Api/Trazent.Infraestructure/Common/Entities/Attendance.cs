using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Infraestructure.Common.Entities
{
    public class Attendance
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Companies Company { get; set; }
        public Users User { get; set; }
        public Sites Site { get; set; }
        public AttendanceTypeEnum Type { get; set; }
        public DateTime CapturedAtDevice { get; set; }
        public DateTime ReceivedAtServer { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public float AccuracyMeters { get; set; }
        public float DistanceMeters { get; set; }
        public bool IsMocked { get; set; }
        public string PhotoKey { get; set; }
        public GeofenceStatusType GeofenceStatus { get; set; }
        public SyncStatusTypeEnum StatusSync { get; set; }


    }
}
