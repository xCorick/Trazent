-- ../functions/20261116_171025_get_device_tokens_by_user.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:25 MST 2026
--
-- Función get_device_tokens_by_user.

CREATE OR REPLACE FUNCTION public.get_device_tokens_by_user(
    p_id uuid
) RETURNS TABLE(
    token character varying,
    platform smallint
)
    LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT d.token, d.platform
      FROM public.device_tokens d
      JOIN public.users u ON u.id = d.user_id
     WHERE d.user_id = p_id AND u.status = 0
     ORDER BY d.last_seen_at DESC;
END;
$function$;
