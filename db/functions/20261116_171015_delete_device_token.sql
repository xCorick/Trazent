-- ../functions/20261116_171015_delete_device_token.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:15 MST 2026
--
-- Función delete_device_token.

CREATE OR REPLACE FUNCTION public.delete_device_token(
    p_token character varying,
    p_user_id uuid DEFAULT NULL
) RETURNS boolean
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted integer;
BEGIN
    DELETE FROM public.device_tokens d
     WHERE d.token = p_token
       AND (p_user_id IS NULL OR d.user_id = p_user_id);
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted > 0;
END;
$function$;
