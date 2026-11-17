-- ../functions/20261116_171048_revoke_refresh_token.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:48 MST 2026
--
-- Función revoke_refresh_token.

CREATE OR REPLACE FUNCTION public.revoke_refresh_token(
    p_token_hash character varying
) RETURNS boolean
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_updated integer;
BEGIN
    UPDATE public.refresh_tokens r
       SET revoked_at = now()
     WHERE r.token_hash = p_token_hash AND r.revoked_at IS NULL;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$function$;
