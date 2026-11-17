-- ../functions/20261116_171053_update_contractor.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:53 MST 2026
--
-- Función update_contractor.

CREATE OR REPLACE FUNCTION public.update_contractor(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_full_name character varying DEFAULT NULL,
    p_phone character varying DEFAULT NULL,
    p_specialty character varying DEFAULT NULL
) RETURNS uuid
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_user_id uuid;
BEGIN
    UPDATE public.contractors ct
       SET phone = COALESCE(p_phone, ct.phone),
           specialty = COALESCE(p_specialty, ct.specialty),
           updated_at = NOW()
     WHERE ct.id = p_id
       AND (p_company_id IS NULL OR ct.company_id = p_company_id)
    RETURNING ct.user_id INTO v_user_id;

    IF p_full_name IS NOT NULL AND v_user_id IS NOT NULL THEN
        UPDATE public.users u
           SET full_name = p_full_name,
               updated_at = NOW()
         WHERE u.id = v_user_id;
    END IF;

    RETURN p_id;
END;
$function$;
