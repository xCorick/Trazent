-- ../functions/20261116_171042_register_device_token.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:42 MST 2026
--
-- Función register_device_token.

CREATE OR REPLACE FUNCTION public.register_device_token(
    p_user_id uuid,
    p_token character varying,
    p_platform smallint
) RETURNS uuid
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
    v_token text := NULLIF(btrim(COALESCE(p_token, '')), '');
BEGIN
    INSERT INTO public.device_tokens (user_id, token, platform)
    VALUES (p_user_id, v_token, p_platform)
    ON CONFLICT (token) DO UPDATE
        SET user_id = EXCLUDED.user_id,
            platform = EXCLUDED.platform,
            last_seen_at = now()
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$function$;
