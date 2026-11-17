-- ../functions/20261116_171044_register_failed_login.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:44 MST 2026
--
-- Función register_failed_login.

CREATE OR REPLACE FUNCTION public.register_failed_login(
    p_id uuid,
    p_max_failed_attempts integer DEFAULT 5,
    p_lockout_minutes integer DEFAULT 15
) RETURNS TABLE(
    failed_count integer,
    locked_until timestamp with time zone,
    is_locked_out boolean
)
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_count integer;
    v_lockout timestamp with time zone;
BEGIN
    UPDATE public.users u
       SET access_failed_count = CASE WHEN u.access_failed_count + 1 >= p_max_failed_attempts
                                      THEN 0 ELSE u.access_failed_count + 1 END,
           lockout_end = CASE WHEN u.access_failed_count + 1 >= p_max_failed_attempts
                              THEN now() + make_interval(mins => p_lockout_minutes)
                              ELSE u.lockout_end END
     WHERE u.id = p_id
    RETURNING u.access_failed_count, u.lockout_end INTO v_count, v_lockout;

    RETURN QUERY SELECT v_count, v_lockout, (v_lockout IS NOT NULL AND v_lockout > now());
END;
$function$;
