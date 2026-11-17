# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore Trazent.Api.slnx

RUN dotnet publish Trazent.Api/Trazent.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

CMD ["sh", "-c", "dotnet Trazent.Api.dll --urls http://+:${PORT:-8080}"]