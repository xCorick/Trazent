-- ../functions/20261116_171034_get_sites_by_company.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:34 MST 2026
--
-- Función get_sites_by_company.

CREATE OR REPLACE FUNCTION public.get_sites_by_company(
    p_company_id uuid,
    p_is_active boolean DEFAULT NULL
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
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.address, s.latitude, s.longitude, s.radius_meters, s.is_active,
           (SELECT count(*)::integer FROM public.site_assignments sa WHERE sa.site_id = s.id),
           s.created_at, s.updated_at
      FROM public.sites s
     WHERE s.company_id = p_company_id
       AND (p_is_active IS NULL OR s.is_active = p_is_active)
     ORDER BY s.name;
END;
$function$;
