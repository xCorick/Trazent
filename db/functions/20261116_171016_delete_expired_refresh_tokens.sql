-- ../functions/20261116_171016_delete_expired_refresh_tokens.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:16 MST 2026
--
-- Función delete_expired_refresh_tokens.

CREATE OR REPLACE FUNCTION public.delete_expired_refresh_tokens(
    p_retention_days integer DEFAULT 30
) RETURNS integer
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted integer;
BEGIN
    DELETE FROM public.refresh_tokens r
     WHERE r.expires_at < now() - make_interval(days => COALESCE(p_retention_days, 30))
        OR r.revoked_at < now() - make_interval(days => COALESCE(p_retention_days, 30));
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$function$;
