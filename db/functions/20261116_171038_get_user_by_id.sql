-- ../functions/20261116_171038_get_user_by_id.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:38 MST 2026
--
-- Función get_user_by_id.

CREATE OR REPLACE FUNCTION public.get_user_by_id(
    p_id uuid,
    p_company_id uuid DEFAULT NULL
) RETURNS TABLE(
    user_id uuid,
    company_id uuid,
    company_name character varying,
    company_is_active boolean,
    full_name character varying,
    user_role smallint,
    user_status smallint,
    user_name character varying,
    email character varying,
    phone_number character varying,
    security_stamp text,
    lockout_end timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
    LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT u.id, u.company_id, c.name, c.is_active, u.full_name, u.role, u.status, u.user_name,
           u.email, u.phone_number, u.security_stamp, u.lockout_end, u.created_at, u.updated_at
      FROM public.users u
      JOIN public.companies c ON c.id = u.company_id
     WHERE u.id = p_id
       AND (p_company_id IS NULL OR u.company_id = p_company_id);
END;
$function$;
