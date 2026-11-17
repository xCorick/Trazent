using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using Trazent.Core.Infraestructure.Services;
using Trazent.Infraestructure.Models;

namespace Trazent.Core.Implementations.Services
{
    public class AppSyncSettings
    {
        public string HttpEndpoint { get; set; } = string.Empty;
    }

    public class AppSyncEventsService : IAppSyncEventsService
        {
            private readonly HttpClient _httpClient;
            private readonly AppSyncSettings _settings;
            private readonly ILogger<AppSyncEventsService> _logger;

            public AppSyncEventsService(
                HttpClient httpClient,
                IOptions<AppSyncSettings> settings,
                ILogger<AppSyncEventsService> logger)
            {
                _httpClient = httpClient;
                _settings = settings.Value;
                _logger = logger;
            }

            public async Task PublishAsync(List<AppSyncEventRequest> requests, string channel = "/default/events")
            {

                List<AppSyncEventRequest> reducedRequests = [.. requests
                .Where(req => req.Payload is not null)
                .Concat(
                    requests
                        .Where(req => req.Payload is null)
                        .GroupBy(req => req.Type)
                        .Select(group => group.First())
                )
                ];

                var chunks = reducedRequests.Chunk(5).Select(requestChunk => MakePublishAsync([.. requestChunk], channel));

                await Task.WhenAll(chunks);
            }

            public async Task MakePublishAsync(List<AppSyncEventRequest> requests, string channel = "/default/events")
            {
                try
                {
                    object[] eventData = [.. requests.Select(request => JsonConvert.SerializeObject(new
                {
                    type = request.Type,
                    payload = request.Payload,
                    timestamp = DateTimeOffset.UtcNow
                }))];

                    var body = JsonConvert.SerializeObject(new
                    {
                        channel,
                        events = eventData
                    });

                    var request = new HttpRequestMessage(HttpMethod.Post, $"{_settings.HttpEndpoint}/event")
                    {
                        Content = new StringContent(body, Encoding.UTF8, "application/json")
                    };

                    var response = await _httpClient.SendAsync(request);

                    if (!response.IsSuccessStatusCode)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();
                        _logger.LogWarning("AppSync publish failed: {StatusCode} {Body}", response.StatusCode, responseBody);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error publishing AppSync event");
                }
            }

            public async Task PublishAsync(AppSyncEventRequest request) => await PublishAsync([request]);
        }
    }