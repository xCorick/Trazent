-- ../functions/20261116_171009_create_company.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:09 MST 2026
--
-- Función create_company.

CREATE OR REPLACE FUNCTION public.create_company(p_name character varying, p_plan smallint DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
    v_name text := NULLIF(btrim(COALESCE(p_name, '')), '');
BEGIN
    INSERT INTO public.companies (name, plan)
    VALUES (v_name, p_plan)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$function$;
