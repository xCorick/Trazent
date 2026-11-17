-- ../functions/20261116_171045_reset_login_failures.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:45 MST 2026
--
-- Función reset_login_failures.

CREATE OR REPLACE FUNCTION public.reset_login_failures(
    p_id uuid
) RETURNS void
    LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.users u
       SET access_failed_count = 0,
           lockout_end = NULL
     WHERE u.id = p_id
       AND (u.access_failed_count <> 0 OR u.lockout_end IS NOT NULL);
END;
$function$;
