-- ../functions/20261116_171017_delete_stale_device_tokens.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:17 MST 2026
--
-- Función delete_stale_device_tokens.

CREATE OR REPLACE FUNCTION public.delete_stale_device_tokens(
    p_days integer DEFAULT 90
) RETURNS integer
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted integer;
BEGIN
    DELETE FROM public.device_tokens d
     WHERE d.last_seen_at < now() - make_interval(days => COALESCE(p_days, 90));
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$function$;
