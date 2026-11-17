using System;
using System.Collections.Generic;
using System.Text;

namespace Trazent.Infraestructure.Models
{
   public class AppSyncEventRequest
    {
        public string Type { get; set; }
        public object? Payload { get; set; }
    }
}