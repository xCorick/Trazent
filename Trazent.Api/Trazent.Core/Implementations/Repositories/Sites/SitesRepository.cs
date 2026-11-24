using System.Data;
using Npgsql;
using Trazent.Core.Infraestructure.Repositories;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Core.Implementations.Repositories
{
    public class SitesRepository : ISitesRepository
    {
        private NpgsqlConnection _connection = default!;
        private NpgsqlTransaction? _transaction;

        public void SetConnection(NpgsqlConnection connection, NpgsqlTransaction? transaction = null)
        {
            _connection = connection ?? throw new ArgumentNullException(nameof(connection));
            _transaction = transaction;
        }
        #region CreateSiteAsync
        public async Task<Guid> CreateSiteAsync(Sites site)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "create_site";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.AddWithValue("p_company_id", site.Company.Id);
            command.Parameters.AddWithValue("p_name", site.Name);
            command.Parameters.AddWithValue("p_address", (object?)site.Address ?? DBNull.Value);
            command.Parameters.AddWithValue("p_latitude", site.Latitude);
            command.Parameters.AddWithValue("p_longitude", site.Longitude);
            command.Parameters.AddWithValue("p_radius_meters", site.RadiusMeter);
            return (Guid)(await command.ExecuteScalarAsync())!;
        }
        #endregion
        #region GetAllSitesAsync
        public async Task<List<Sites>> GetAllSitesAsync()
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "get_all_sites";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await command.ExecuteReaderAsync();
            var sites = new List<Sites>();

            while (await reader.ReadAsync())
            {
                sites.Add(new Sites
                {
                    Id = reader.GetGuid(reader.GetOrdinal("site_id")),
                    Company = new Companies
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("company_id"))
                    },
                    Name = reader.GetString(reader.GetOrdinal("name")),
                    Address = reader.IsDBNull(reader.GetOrdinal("address"))
                        ? string.Empty
                        : reader.GetString(reader.GetOrdinal("address")),
                    Latitude = reader.GetDouble(reader.GetOrdinal("latitude")),
                    Longitude = reader.GetDouble(reader.GetOrdinal("longitude")),
                    RadiusMeter = reader.GetInt32(reader.GetOrdinal("radius_meters")),
                    IsActive = reader.GetBoolean(reader.GetOrdinal("is_active")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
                    UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at"))
                        ? null
                        : reader.GetDateTime(reader.GetOrdinal("updated_at"))
                });
            }

            return sites;
        }
        #endregion
        #region GetSitesByCompanyAsync
        public async Task<List<Sites>> GetSitesByCompanyAsync(Guid companyId, bool? isActive = null)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "get_sites_by_company";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.AddWithValue("p_company_id", companyId);
            command.Parameters.AddWithValue("p_is_active", (object?)isActive ?? DBNull.Value);

            await using var reader = await command.ExecuteReaderAsync();

            var sites = new List<Sites>();

            while (await reader.ReadAsync()) sites.Add(ReadSite(reader));
            return sites;
        }
        #endregion
        #region GetSitesByUserAsync
        public async Task<List<Sites>> GetSitesByUserAsync(Guid userId)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "get_my_sites";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_id", userId);
            await using var reader = await command.ExecuteReaderAsync();
            var sites = new List<Sites>();
            while (await reader.ReadAsync())
            {
                sites.Add(new Sites
                {
                    Id = reader.GetGuid(reader.GetOrdinal("site_id")),
                    Name = reader.GetString(reader.GetOrdinal("name")),
                    Address = reader.IsDBNull(reader.GetOrdinal("address")) ? string.Empty : reader.GetString(reader.GetOrdinal("address")),
                    Latitude = reader.IsDBNull(reader.GetOrdinal("latitude")) ? 0 : reader.GetDouble(reader.GetOrdinal("latitude")),
                    Longitude = reader.IsDBNull(reader.GetOrdinal("longitude")) ? 0 : reader.GetDouble(reader.GetOrdinal("longitude")),
                    RadiusMeter = reader.GetInt32(reader.GetOrdinal("radius_meters"))
                });
            }
            return sites;
        }
        #endregion
        #region GetSiteByIdAsync
        public async Task<Sites?> GetSiteByIdAsync(Guid id, Guid? companyId = null)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "get_site_by_id";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.AddWithValue("p_id", id);
            command.Parameters.AddWithValue("p_company_id", (object?)companyId ?? DBNull.Value);
            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? ReadSite(reader) : null;
        }
        #endregion
        #region UpdateSiteAsync
        public async Task<Sites?> UpdateSiteAsync(Sites site)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "update_site";

            await using (var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            })
            {
                command.Parameters.AddWithValue("p_id", site.Id);
                command.Parameters.AddWithValue("p_company_id",
                    site.Company is null || site.Company.Id == Guid.Empty ? DBNull.Value : (object)site.Company.Id);
                command.Parameters.AddWithValue("p_name", (object?)site.Name ?? DBNull.Value);
                command.Parameters.AddWithValue("p_address", (object?)site.Address ?? DBNull.Value);
                command.Parameters.AddWithValue("p_latitude", site.Latitude);
                command.Parameters.AddWithValue("p_longitude", site.Longitude);
                command.Parameters.AddWithValue("p_radius_meters", site.RadiusMeter);
                var id = await command.ExecuteScalarAsync();
                if (id is null or DBNull) return null;
            }
            return await GetSiteByIdAsync(site.Id, site.Company?.Id == Guid.Empty ? null : site.Company?.Id);
        }
        #endregion
        #region ChangeSiteStatusByIdAsync
        public async Task<Sites?> ChangeSiteStatusByIdAsync(Guid id)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "change_site_status_by_id";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_id", id);

            var changed = await command.ExecuteScalarAsync();

            return changed is null or DBNull ? null : await GetSiteByIdAsync(id);
        }
        #endregion
        #region GetSiteAssignmentsBySiteAsync
        public async Task<List<SiteAssignments>> GetSiteAssignmentsBySiteAsync(Guid siteId, Guid? companyId = null)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "get_site_assignments";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_id", siteId);
            command.Parameters.AddWithValue("p_company_id", (object?)companyId ?? DBNull.Value);
            await using var reader = await command.ExecuteReaderAsync();
            var assignments = new List<SiteAssignments>();
            while (await reader.ReadAsync())
            {
                assignments.Add(new SiteAssignments
                {
                    Id = reader.GetGuid(reader.GetOrdinal("assignment_id")),
                    Site = new Sites { Id = siteId },
                    User = new Users
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("user_id")),
                        FullName = reader.GetString(reader.GetOrdinal("full_name")),
                        Email = reader.GetString(reader.GetOrdinal("email")),
                        Status = (StatusTypeEnum)reader.GetInt16(reader.GetOrdinal("user_status"))
                    },
                    AssignedById = reader.GetGuid(reader.GetOrdinal("assigned_by_id")),
                    AssignedByName = reader.GetString(reader.GetOrdinal("assigned_by_name")),
                    AssignedAt = reader.GetDateTime(reader.GetOrdinal("assigned_at"))
                });
            }
            return assignments;
        }
        #endregion
        #region AssignUserToSiteAsync
        public async Task<Guid> AssignUserToSiteAsync(Guid siteId, Guid userId, Guid assignedById, Guid? companyId = null)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

           const string sql = "assign_site_user";

           await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_site_id", siteId);
            command.Parameters.AddWithValue("p_user_id", userId);
            command.Parameters.AddWithValue("p_assigned_by_id", assignedById);
            command.Parameters.AddWithValue("p_company_id", (object?)companyId ?? DBNull.Value);

            return (Guid)(await command.ExecuteScalarAsync())!;
        }
        #endregion
        #region UnassignUserFromSiteAsync
        public async Task<bool> UnassignUserFromSiteAsync(Guid siteId, Guid userId, Guid? companyId = null)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");
            const string sql = "unassign_site_user";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_site_id", siteId);
            command.Parameters.AddWithValue("p_user_id", userId);
            command.Parameters.AddWithValue("p_company_id", (object?)companyId ?? DBNull.Value);

            return (bool)(await command.ExecuteScalarAsync())!;
        }
        #endregion
        #region ReadSite
        private static Sites ReadSite(NpgsqlDataReader reader)
        {
            int Ordinal(string name) => reader.GetOrdinal(name);
            var site = new Sites
            {
                Id = reader.GetGuid(Ordinal("site_id")),
                Company = new Companies(),
                Name = reader.GetString(Ordinal("name")),
                Address = reader.IsDBNull(Ordinal("address")) ? string.Empty : reader.GetString(Ordinal("address")),
                Latitude = reader.IsDBNull(Ordinal("latitude")) ? 0 : reader.GetDouble(Ordinal("latitude")),
                Longitude = reader.IsDBNull(Ordinal("longitude")) ? 0 : reader.GetDouble(Ordinal("longitude")),
                RadiusMeter = reader.GetInt32(Ordinal("radius_meters")),
                IsActive = reader.GetBoolean(Ordinal("is_active")),
                AssignedContractors = reader.GetInt32(Ordinal("assigned_contractors")),
                CreatedAt = reader.GetDateTime(Ordinal("created_at")),
                UpdatedAt = reader.IsDBNull(Ordinal("updated_at")) ? null : reader.GetDateTime(Ordinal("updated_at"))
            };
            return site;
        }
        #endregion
    }
}
