-- ../functions/20261116_171033_get_site_by_id.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:33 MST 2026
--
-- Función get_site_by_id.

CREATE OR REPLACE FUNCTION public.get_site_by_id(
    p_id uuid,
    p_company_id uuid DEFAULT NULL
) RETURNS TABLE(
    site_id uuid,
    name character varying,
    address character varying,
    latitude double precision,
    longitude double precision,
    radius_meters integer,
    is_active boolean,
    assigned_contractors integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
    LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.address, s.latitude, s.longitude, s.radius_meters, s.is_active,
           (SELECT count(*)::integer FROM public.site_assignments sa WHERE sa.site_id = s.id),
           s.created_at, s.updated_at
      FROM public.sites s
     WHERE s.id = p_id
       AND (p_company_id IS NULL OR s.company_id = p_company_id);
END;
$function$;
