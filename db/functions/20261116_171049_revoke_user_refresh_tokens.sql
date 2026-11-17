-- ../functions/20261116_171049_revoke_user_refresh_tokens.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:49 MST 2026
--
-- Función revoke_user_refresh_tokens.

CREATE OR REPLACE FUNCTION public.revoke_user_refresh_tokens(
    p_id uuid
) RETURNS integer
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_updated integer;
BEGIN
    UPDATE public.refresh_tokens r
       SET revoked_at = now()
     WHERE r.user_id = p_id AND r.revoked_at IS NULL;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated;
END;
$function$;
