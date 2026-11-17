-- ../functions/20261116_171039_get_user_for_login.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:39 MST 2026
--
-- Función get_user_for_login.

CREATE OR REPLACE FUNCTION public.get_user_for_login(
    p_email character varying
) RETURNS TABLE(
    user_id uuid,
    company_id uuid,
    full_name character varying,
    user_role smallint,
    user_status smallint,
    user_name character varying,
    email character varying,
    password_hash text,
    security_stamp text,
    lockout_end timestamp with time zone,
    access_failed_count integer,
    company_is_active boolean
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT u.id, u.company_id, u.full_name, u.role, u.status, u.user_name, u.email,
           u.password_hash, u.security_stamp, u.lockout_end, u.access_failed_count, c.is_active
      FROM public.users u
      JOIN public.companies c ON c.id = u.company_id
     WHERE lower(u.email) = lower(btrim(p_email));
END;
$function$;
