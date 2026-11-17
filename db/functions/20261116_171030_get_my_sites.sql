-- ../functions/20261116_171030_get_my_sites.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:30 MST 2026
--
-- Función get_my_sites.

CREATE OR REPLACE FUNCTION public.get_my_sites(
    p_id uuid
) RETURNS TABLE(
    site_id uuid,
    name character varying,
    address character varying,
    latitude double precision,
    longitude double precision,
    radius_meters integer
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.address, s.latitude, s.longitude, s.radius_meters
      FROM public.site_assignments sa
      JOIN public.sites s ON s.id = sa.site_id
      JOIN public.users u ON u.id = sa.user_id AND u.company_id = s.company_id
     WHERE sa.user_id = p_id
       AND s.is_active
     ORDER BY s.name;
END;
$function$;
