-- ../functions/20261116_171008_change_user_status.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:08 MST 2026
--
-- Función change_user_status.

CREATE OR REPLACE FUNCTION public.change_user_status(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_status smallint DEFAULT 0
) RETURNS smallint
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
BEGIN
    UPDATE public.users u
       SET status = p_status,
           security_stamp = CASE WHEN p_status <> 0 THEN gen_random_uuid()::text ELSE u.security_stamp END,
           updated_at = NOW()
     WHERE u.id = p_id
       AND (p_company_id IS NULL OR u.company_id = p_company_id)
    RETURNING u.id INTO v_id;

    IF p_status <> 0 THEN
        UPDATE public.refresh_tokens r SET revoked_at = now()
         WHERE r.user_id = p_id AND r.revoked_at IS NULL;
        DELETE FROM public.device_tokens d WHERE d.user_id = p_id;
    END IF;

    RETURN p_status;
END;
$function$;
