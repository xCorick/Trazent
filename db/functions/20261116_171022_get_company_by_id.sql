-- ../functions/20261116_171022_get_company_by_id.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:22 MST 2026
--
-- Función get_company_by_id.

CREATE OR REPLACE FUNCTION public.get_company_by_id(p_id uuid, p_is_active boolean DEFAULT NULL::boolean)
 RETURNS TABLE(company_id uuid, name character varying, plan smallint, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.plan,
        c.is_active,
        c.created_at,
        c.updated_at
    FROM public.companies c
    WHERE c.id = p_id
      AND (p_is_active IS NULL OR c.is_active = p_is_active);
END;
$function$;
