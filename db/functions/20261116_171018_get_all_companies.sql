-- ../functions/20261116_171018_get_all_companies.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:18 MST 2026
--
-- Función get_all_companies.

CREATE OR REPLACE FUNCTION public.get_all_companies()
 RETURNS TABLE(company_id uuid, name character varying, plan smallint, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS company_id,
        c.name,
        c.plan,
        c.is_active,
        c.created_at,
        c.updated_at
    FROM public.companies c
    ORDER BY c.name;
END;
$function$;
