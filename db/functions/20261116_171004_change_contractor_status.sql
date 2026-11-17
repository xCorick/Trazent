-- ../functions/20261116_171004_change_contractor_status.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:04 MST 2026
--
-- Función change_contractor_status.

CREATE OR REPLACE FUNCTION public.change_contractor_status(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_status smallint DEFAULT 0
) RETURNS smallint
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_user_id uuid;
BEGIN
    UPDATE public.contractors ct
       SET status = p_status,
           updated_at = NOW()
     WHERE ct.id = p_id
       AND (p_company_id IS NULL OR ct.company_id = p_company_id)
    RETURNING ct.user_id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
        PERFORM public.change_user_status(v_user_id, p_company_id, p_status);
    END IF;

    RETURN p_status;
END;
$function$;
