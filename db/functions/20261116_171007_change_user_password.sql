-- ../functions/20261116_171007_change_user_password.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:07 MST 2026
--
-- Función change_user_password.

CREATE OR REPLACE FUNCTION public.change_user_password(
    p_id uuid,
    p_password_hash text,
    p_security_stamp text,
    p_company_id uuid DEFAULT NULL
) RETURNS boolean
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
BEGIN
    UPDATE public.users u
       SET password_hash = p_password_hash,
           security_stamp = p_security_stamp,
           access_failed_count = 0,
           lockout_end = NULL,
           updated_at = NOW()
     WHERE u.id = p_id
       AND (p_company_id IS NULL OR u.company_id = p_company_id)
    RETURNING u.id INTO v_id;

    UPDATE public.refresh_tokens r SET revoked_at = now()
     WHERE r.user_id = p_id AND r.revoked_at IS NULL;

    RETURN v_id IS NOT NULL;
END;
$function$;
