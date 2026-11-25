using GraphQL.AspNet.Configuration;
using Trazent.Api.DataAccess;
using Trazent.Api.GraphQL.Mapping;
using Trazent.Core.Infraestructure.Services;
using Trazent.Core;
using AutoMapper;

System.AppContext.SetSwitch(
    "Npgsql.EnableStoredProcedureCompatMode",
    true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IDatabaseConnection, DatabaseConnection>();
builder.Services.RegisterCoreServices();
builder.Services.AddAutoMapper(configuration =>
    configuration.AddMaps(typeof(CompaniesMappingProfile).Assembly));
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy
            .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
            .AllowAnyHeader()
            .AllowAnyMethod()));

// Add services to the container.

builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();


// Add GraphQL
builder.Services
    .AddGraphQL();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

app.UseGraphQLGraphiQL("/ui/playground");

app.UseHttpsRedirection();

app.UseForwardedHeaders();

app.UseGraphQL();

app.UseAuthorization();

app.MapControllers();

app.Run();