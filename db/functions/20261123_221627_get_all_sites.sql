-- /c/Users/zoria/Downloads/ESCUELA/Integradora/p/Trazent/db/functions/20261123_221627_get_all_sites.sql
-- Author: ZorialCart
-- Date: Mon, Nov 23, 2026 10:16:28 PM
--
-- Write your SQL below

CREATE OR REPLACE FUNCTION public.get_all_sites()
RETURNS TABLE(
    site_id uuid,
    company_id uuid,
    name character varying,
    address character varying,
    latitude double precision,
    longitude double precision,
    radius_meters integer,
    is_active boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        s.id AS site_id,
        s.company_id,
        s.name,
        s.address,
        s.latitude,
        s.longitude,
        s.radius_meters,
        s.is_active,
        s.created_at,
        s.updated_at
    FROM public.sites s
    ORDER BY s.name;
END;
$function$;
