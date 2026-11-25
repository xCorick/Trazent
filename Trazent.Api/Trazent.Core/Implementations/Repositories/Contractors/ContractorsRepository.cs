using System.Data;
using Npgsql;
using Trazent.Core.Infraestructure.Repositories;
using Trazent.Infraestructure.Common.Entities;
using Trazent.Infraestructure.Common.Enums;

namespace Trazent.Core.Implementations.Repositories;

public class ContractorsRepository : IContractorsRepository
{
    private NpgsqlConnection _connection = default!;
    private NpgsqlTransaction? _transaction;

    public void SetConnection(NpgsqlConnection connection, NpgsqlTransaction? transaction = null)
    {
        _connection = connection ?? throw new ArgumentNullException(nameof(connection));
        _transaction = transaction;
    }

    public async Task<Contractors?> CreateContractorAsync(Contractors contractor, string passwordHash, string securityStamp, string concurrencyStamp)
    {
        EnsureConnection();
        const string sql = "create_contractor";

        await using var command = new NpgsqlCommand(sql, _connection, _transaction)
        {
            CommandType = CommandType.StoredProcedure
        };
        var user = contractor.User;
        command.Parameters.AddWithValue("p_company_id", contractor.Company.Id);
        command.Parameters.AddWithValue("p_full_name", user.FullName);
        command.Parameters.AddWithValue("p_email", user.Email);
        command.Parameters.AddWithValue("p_user_name", user.Username);
        command.Parameters.AddWithValue("p_password_hash", passwordHash);
        command.Parameters.AddWithValue("p_security_stamp", securityStamp);
        command.Parameters.AddWithValue("p_concurrency_stamp", concurrencyStamp);
        command.Parameters.AddWithValue("p_phone", (object?)contractor.Phone ?? DBNull.Value);
        command.Parameters.AddWithValue("p_specialty", (object?)contractor.Speciality ?? DBNull.Value);

        Guid contractorId;

        await using (var reader = await command.ExecuteReaderAsync())
        {
            if (!await reader.ReadAsync()) return null;
            contractorId = reader.GetGuid(reader.GetOrdinal("contractor_id"));
        }
        return await GetContractorByIdAsync(contractorId, contractor.Company.Id);
    }

    public async Task<Contractors?> GetContractorByIdAsync(Guid id, Guid? companyId = null)
    {
        EnsureConnection();
        const string sql = "get_contractor_by_id";
        await using var command = new NpgsqlCommand(sql, _connection, _transaction)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("p_id", id);
        command.Parameters.AddWithValue("p_company_id", (object?)companyId ?? DBNull.Value);

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync()) 
            return null;

        var contractor = ReadContractor(reader, true);

        contractor.Company = new Companies 
        { 
            Id = companyId ?? Guid.Empty }
        ;

        return contractor;
    }

    public async Task<List<Contractors>> GetContractorsByCompanyAsync(Guid companyId, short? status = null)
    {
        EnsureConnection();
        const string sql = "get_contractors_by_company";

        await using var command = new NpgsqlCommand(sql, _connection, _transaction)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("p_company_id", companyId);
        command.Parameters.AddWithValue("p_status", (object?)status ?? DBNull.Value);

        await using var reader = await command.ExecuteReaderAsync();

        var contractors = new List<Contractors>();

        while (await reader.ReadAsync())
        {
            var contractor = ReadContractor(reader, false);
            contractor.Company = new Companies { Id = companyId };
            contractors.Add(contractor);
        }
        return contractors;
    }

    public async Task<Contractors?> UpdateContractorAsync(Contractors contractor)
    {
        EnsureConnection();
        const string sql = "update_contractor";

        await using var command = new NpgsqlCommand(sql, _connection, _transaction)
        {
            CommandType = CommandType.StoredProcedure
        };

        command.Parameters.AddWithValue("p_id", contractor.Id);
        command.Parameters.AddWithValue("p_company_id", (object?)contractor.Company?.Id ?? DBNull.Value);
        command.Parameters.AddWithValue("p_full_name", (object?)contractor.User?.FullName ?? DBNull.Value);
        command.Parameters.AddWithValue("p_phone", (object?)contractor.Phone ?? DBNull.Value);
        command.Parameters.AddWithValue("p_specialty", (object?)contractor.Speciality ?? DBNull.Value);

        var updatedId = await command.ExecuteScalarAsync();

        if (updatedId is null or DBNull) 
            return null;

        return await GetContractorByIdAsync(contractor.Id, contractor.Company?.Id);
    }

    public async Task<Contractors?> ChangeContractorStatusAsync(Guid id, Guid? companyId, short status)
    {
        EnsureConnection();
        const string sql = "change_contractor_status";

        await using var command = new NpgsqlCommand(sql, _connection, _transaction)
        {
            CommandType = CommandType.StoredProcedure
        };

        command.Parameters.AddWithValue("p_id", id);
        command.Parameters.AddWithValue("p_company_id", (object?)companyId ?? DBNull.Value);
        command.Parameters.AddWithValue("p_status", status);

        var changed = await command.ExecuteScalarAsync();

        if (changed is null or DBNull) return null;

        return await GetContractorByIdAsync(id, companyId);
    }

    private static Contractors ReadContractor(NpgsqlDataReader reader, bool hasUpdatedAt)
    {
        int Ordinal(string name) => reader.GetOrdinal(name);
        return new Contractors
        {
            Id = reader.GetGuid(Ordinal("contractor_id")),
            User = new Users
            {
                Id = reader.GetGuid(Ordinal("user_id")),
                FullName = reader.GetString(Ordinal("full_name")),
                Email = reader.GetString(Ordinal("email")),
                Status = (StatusTypeEnum)reader.GetInt16(Ordinal("user_status"))
            },
            Phone = reader.IsDBNull(Ordinal("phone")) ? null! : reader.GetString(Ordinal("phone")),
            Speciality = reader.IsDBNull(Ordinal("specialty")) ? null! : reader.GetString(Ordinal("specialty")),
            Status = (StatusTypeEnum)reader.GetInt16(Ordinal("contractor_status")),
            AssignedSites = reader.GetInt32(Ordinal("assigned_sites")),
            CreatedAt = reader.GetDateTime(Ordinal("created_at")),
            UpdatedAt = hasUpdatedAt && !reader.IsDBNull(Ordinal("updated_at")) ? reader.GetDateTime(Ordinal("updated_at")) : null
        };
    }

    private void EnsureConnection()
    {
        if (_connection is null) 
                throw new InvalidOperationException("Connection not initialized.");
    }
}
