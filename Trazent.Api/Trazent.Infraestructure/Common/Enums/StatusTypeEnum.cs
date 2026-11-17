using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Text;


namespace Trazent.Infraestructure.Common.Enums
{
    /// <summary>
    /// Defines the status types applicable to users and contractors.
    /// </summary>
    public enum StatusTypeEnum
    {
        /// <summary>
        /// Users: The account is active and can sign in.
        /// Contractors: The contractor is currently working for the company.
        /// </summary>
        ACTIVE = 0,

        /// <summary>
        /// Users: The account has been deactivated.
        /// Contractors: The contractor no longer works for the company.
        /// </summary>
        INACTIVE = 1,

        /// <summary>
        /// Users: The account is temporarily blocked by an administrator.
        /// Contractors: The contractor is temporarily suspended.
        /// </summary>
        SUSPENDED = 2
    }
}

