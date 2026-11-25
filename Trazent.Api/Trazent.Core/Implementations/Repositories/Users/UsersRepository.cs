using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net.NetworkInformation;
using System.Text;
using Trazent.Core.Infraestructure.Repositories;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Core.Implementations.Repositories
{
    public class UsersRepository : IUsersRepository
    {
        NpgsqlConnection _connection = default!;
        NpgsqlTransaction? _transaction;

        public void SetConnection(NpgsqlConnection connection, NpgsqlTransaction? transaction = null)
        {
            _connection = connection ?? throw new ArgumentNullException(nameof(connection));
            _transaction = transaction;
        }

        #region CreateUsersAsync
        public async Task<string> CreateUserAsync(Users user)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "create_user";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_company_id", user.Company.Id);
            command.Parameters.AddWithValue("p_full_name", user.FullName);
            command.Parameters.AddWithValue("p_role", (RoleTypeEnum)(short)user.Role);
            command.Parameters.AddWithValue("p_email", user.Email);
            command.Parameters.AddWithValue("p_user_name", user.Username);
            command.Parameters.AddWithValue("p_password_hash", user.PasswordHash);
            command.Parameters.AddWithValue("p_concurrency_stamp", user.ConcurrencyStamp);
            command.Parameters.AddWithValue("p_phone_number",
                (object?)user.PhoneNumber ?? DBNull.Value);

            var result = await command.ExecuteScalarAsync();

            return Convert.ToString(result) ?? string.Empty;
        }
        #endregion
        #region GetUserById
        public async Task<Users?> GetUserById(Guid id)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not intitialized.");

            const string sql = "get_user_by_id";

            Users? user = new()
            {
                Id = default
            };

            using var command = new NpgsqlCommand(sql, _connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("id", id);
            
            var reader = await command.ExecuteReaderAsync();

            while(await reader.ReadAsync())
            {
                user.Id = reader.GetGuid("id");
                user.Company.Id = reader.GetGuid(reader.GetOrdinal("company_id"));
                user.FullName = reader.GetString(reader.GetOrdinal("full_name"));
                user.Role = (RoleTypeEnum)reader.GetInt16(reader.GetOrdinal("role"));
                user.Status = (StatusTypeEnum)reader.GetInt16(reader.GetOrdinal("status"));
                user.IsActive = reader.GetBoolean(reader.GetOrdinal("is_active"));
                user.Username = reader.GetString(reader.GetOrdinal("full_name"));
                user.SecurityStamp = reader.GetString(reader.GetOrdinal("SecurityStamp"));
                user.ConcurrencyStamp = reader.GetString(reader.GetOrdinal("concurrency_stamp"));
                user.PhoneNumber = reader.GetString(reader.GetOrdinal("phone_number"));
                user.CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at"));
                user.LockoutEnd = reader.GetString(reader.GetOrdinal("lockout_end"));
                user.UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at"))
                     ? null
                     : reader.GetDateTime(reader.GetOrdinal("updated_at"));
            }
            return user.Id != default ? user : null;
        }
        #endregion
        #region GetUserByCompany
        public async Task<List<Users>> GetUsersByCompany(Guid companyId, RoleTypeEnum? role = null, StatusTypeEnum? status = null)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not intialized.");

            const string sql = "get_users_by_company";

            var data = new List<Users?>();

            using var command = new NpgsqlCommand(sql, _connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_company_id", companyId);
            command.Parameters.AddWithValue("p_role", role.HasValue ? (short)role.Value : DBNull.Value);
            command.Parameters.AddWithValue("p_status", status.HasValue ? (short)status.Value : DBNull.Value);

            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                data.Add(new Users
                {
                    Id = reader.GetGuid(reader.GetOrdinal("user_id")),
                    FullName = reader.GetString(reader.GetOrdinal("full_name")),
                    Role = (RoleTypeEnum)reader.GetInt16(reader.GetOrdinal("user_role")),
                    Status = (StatusTypeEnum)reader.GetInt16(reader.GetOrdinal("user_status")),
                    Username = reader.GetString(reader.GetOrdinal("user_name")),
                    Email = reader.GetString(reader.GetOrdinal("email")),

                    PhoneNumber = reader.IsDBNull(reader.GetOrdinal("phone_number"))
                        ? null
                        : reader.GetString(reader.GetOrdinal("phone_number")),

                    LockoutEnd = reader.IsDBNull(reader.GetOrdinal("lockout_end"))
                        ? null
                        : reader.GetString(reader.GetOrdinal("lockout_end")),

                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),

                    UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at"))
                        ? null
                        : reader.GetDateTime(reader.GetOrdinal("updated_at"))
                });
            }

            return data;
        }
        #endregion
        #region UpdateUserByIdAsync
        public async Task UpdateUserByIdAsync(Users user)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initializaed.");

            const string sql = "update_user_profile";

            using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("p_id", user.Id);
            command.Parameters.AddWithValue("p_comany_id", user.Company.Id);
            command.Parameters.AddWithValue("p_full_name", user.FullName);
            command.Parameters.AddWithValue("p_phone_number", (object?)user.PhoneNumber ?? DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }
        #endregion
        #region ChangeIsActiveAsync
        public async Task<bool> ChangeIsActiveAsync(Guid userId, Guid companyId, StatusTypeEnum status)
        {
            if (_connection == null)
                throw new InvalidOperationException("Connection not initialized.");

            const string sql = "change_user_status";

            await using var command = new NpgsqlCommand(sql, _connection, _transaction)
            {
                CommandType = CommandType.Text
            };

            command.Parameters.AddWithValue("p_id", userId);
            command.Parameters.AddWithValue("p_company_id", companyId);
            command.Parameters.AddWithValue("p_status", (StatusTypeEnum)(short)status);


            var result = await command.ExecuteScalarAsync();

            return Convert.ToInt16(result) == (short)status;
        }
        #endregion
    }
}
