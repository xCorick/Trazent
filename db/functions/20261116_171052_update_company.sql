-- ../functions/20261116_171052_update_company.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:52 MST 2026
--
-- Función update_company.

CREATE OR REPLACE FUNCTION public.update_company(p_id uuid, p_name character varying, p_plan smallint)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
BEGIN
    UPDATE public.companies
    SET
        name = COALESCE(p_name, name),
        plan = COALESCE(p_plan, plan),
        updated_at = NOW()
    WHERE id = p_id
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$function$;
