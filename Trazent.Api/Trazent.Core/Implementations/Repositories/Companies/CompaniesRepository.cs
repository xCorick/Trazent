using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;
using Npgsql;
using NpgsqlTypes;
using System.Data;
using System.Text;
using Trazent.Api.Core.Infraestructure.Repositories;
using Trazent.Api.DataAccess;
using Trazent.Infraestructure.Common.Enums;
using Trazent.Infraestructure.Common.Entities;

namespace Trazent.Api.Core.Implementations.Repositories
{
    public class CompaniesRepository : ICompaniesRepository
    {
        private readonly ILogger<CompaniesRepository> _logger;
        private NpgsqlConnection _connection = default!;
        private NpgsqlTransaction? _transaction;

        public CompaniesRepository(ILogger<CompaniesRepository> logger)
             => _logger = logger;

        public void SetConnection(NpgsqlConnection connection, NpgsqlTransaction? transaction = null)
        {
            _connection = connection ?? throw new ArgumentNullException(nameof(connection));
            _transaction = transaction;
        }

        #region CreateCompanyAsync
        public async Task<string> CreateCompanyAsync(Companies company)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "create_company";

            try
            {
                await using var command = new NpgsqlCommand(sql, _connection, _transaction)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("p_name", company.Name);
                command.Parameters.AddWithValue("p_plan", (byte)company.Plan);

                var result = await command.ExecuteScalarAsync();
                return Convert.ToString(result);
            }

            catch (Exception ex)
            {
                throw new Exception($"Error creating company: {ex.Message}", ex);

            }
        }
        #endregion
        #region GetAllCompaniesAsync
        public async Task <List<Companies>> GetAllCompaniesAsync()
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            var companies = new List<Companies>();

            const string sql = "get_all_companies";

            await using var command = new NpgsqlCommand(sql, _connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                companies.Add(new Companies
                {
                    Id = reader.GetGuid(reader.GetOrdinal("company_id")),
                    Name = reader.GetString(reader.GetOrdinal("name")),
                    Plan = (PlanTypeEnum)reader.GetInt16("plan"),
                    IsActive = reader.GetBoolean(reader.GetOrdinal("is_active")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
                    UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("updated_at"))
                });
            }
            return companies;            
        }
        #endregion
        #region UdpateCompanyAsync
        public async Task UpdateCompaniesAsync(Companies company)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "update_company";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_id", company.Id);
            command.Parameters.AddWithValue("p_name", company.Name);
            command.Parameters.AddWithValue("p_plan", (byte)company.Plan);

            await command.ExecuteNonQueryAsync();
        }
        #endregion
        #region GetAllCompanies
        public async Task<List<Companies>> GetAlltCompaniesAsync()
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            var companies = new List<Companies>();

            const string sql = "get_all_companies";

            await using var command = new NpgsqlCommand(sql, _connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                companies.Add(new Companies
                {
                    Id = reader.GetGuid(reader.GetOrdinal("company_id")),
                    Name = reader.GetString(reader.GetOrdinal("name")),
                    Plan = (PlanTypeEnum)reader.GetInt16("plan"),
                    IsActive = reader.GetBoolean(reader.GetOrdinal("is_active")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
                    UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("updated_at"))
                });
            }
            return companies;
        }
        #endregion
        #region GetCompanyById

        public async Task<Companies> GetCompanyById(Guid id, bool? isActive = null)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            Companies company = new()
            {
                Id = default
            };

            const string sql = "get_company_by_id";
            
            await using var command = new NpgsqlCommand(sql, _connection)
            {
                CommandType = CommandType.StoredProcedure
            }; 

            command.Parameters.AddWithValue("p_id", id);
            command.Parameters.AddWithValue("p_is_active", (object?)isActive ?? DBNull.Value);

            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                company.Id = reader.GetGuid(reader.GetOrdinal("company_id"));
                company.IsActive = reader.GetBoolean(reader.GetOrdinal("is_active"));
                company.Name = reader.GetString(reader.GetOrdinal("name"));
                company.Plan = (PlanTypeEnum)reader.GetOrdinal("plan");
                company.CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at"));
                company.UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at"));
            }
            return company;
            //return company.Id != default ? company : null;
        }
        #endregion
        #region ChangeIsActiveByIdAsync
        public async Task<bool> ChangeIsActiveByIdAsync(Guid id)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "change_company_status_by_id";

            await using var command = new NpgsqlCommand(sql, _connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_id", id);

            var result = await command.ExecuteScalarAsync();

            return Convert.ToBoolean(result);
        }
        #endregion
    }
}
