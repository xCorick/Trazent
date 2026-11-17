-- ../functions/20261116_171040_get_users_by_company.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:40 MST 2026
--
-- Función get_users_by_company.

CREATE OR REPLACE FUNCTION public.get_users_by_company(
    p_company_id uuid,
    p_role smallint DEFAULT NULL,
    p_status smallint DEFAULT NULL
) RETURNS TABLE(
    user_id uuid,
    full_name character varying,
    user_role smallint,
    user_status smallint,
    user_name character varying,
    email character varying,
    phone_number character varying,
    lockout_end timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT u.id, u.full_name, u.role, u.status, u.user_name, u.email, u.phone_number,
           u.lockout_end, u.created_at, u.updated_at
      FROM public.users u
     WHERE u.company_id = p_company_id
       AND (p_role IS NULL OR u.role = p_role)
       AND (p_status IS NULL OR u.status = p_status)
     ORDER BY u.full_name;
END;
$function$;
