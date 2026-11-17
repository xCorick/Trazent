using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Infraestructure.Models;

namespace Trazent.Core.Infraestructure.Services
{
    public interface IAppSyncEventsService
    {
        Task PublishAsync(List<AppSyncEventRequest> requests, string channel = "/default/events");
        Task PublishAsync(AppSyncEventRequest request);
    }
}
