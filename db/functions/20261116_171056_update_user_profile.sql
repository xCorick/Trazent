-- ../functions/20261116_171056_update_user_profile.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:56 MST 2026
--
-- Función update_user_profile.

CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_full_name character varying DEFAULT NULL,
    p_phone_number character varying DEFAULT NULL
) RETURNS uuid
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
BEGIN
    UPDATE public.users u
       SET full_name = COALESCE(p_full_name, u.full_name),
           phone_number = COALESCE(p_phone_number, u.phone_number),
           updated_at = NOW()
     WHERE u.id = p_id
       AND (p_company_id IS NULL OR u.company_id = p_company_id)
    RETURNING u.id INTO v_id;

    RETURN v_id;
END;
$function$;
