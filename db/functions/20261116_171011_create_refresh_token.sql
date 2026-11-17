-- ../functions/20261116_171011_create_refresh_token.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:11 MST 2026
--
-- Función create_refresh_token.

CREATE OR REPLACE FUNCTION public.create_refresh_token(
    p_user_id uuid,
    p_token_hash character varying,
    p_expires_at timestamp with time zone
) RETURNS uuid
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO public.refresh_tokens (user_id, token_hash, expires_at)
    VALUES (p_user_id, p_token_hash, p_expires_at)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$function$;
