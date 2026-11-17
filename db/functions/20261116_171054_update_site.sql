-- ../functions/20261116_171054_update_site.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:54 MST 2026
--
-- Función update_site.

CREATE OR REPLACE FUNCTION public.update_site(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_name character varying DEFAULT NULL,
    p_address character varying DEFAULT NULL,
    p_latitude double precision DEFAULT NULL,
    p_longitude double precision DEFAULT NULL,
    p_radius_meters integer DEFAULT NULL
) RETURNS uuid
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
BEGIN
    UPDATE public.sites s
       SET name = COALESCE(p_name, s.name),
           address = COALESCE(p_address, s.address),
           latitude = COALESCE(p_latitude, s.latitude),
           longitude = COALESCE(p_longitude, s.longitude),
           radius_meters = COALESCE(p_radius_meters, s.radius_meters),
           updated_at = NOW()
     WHERE s.id = p_id
       AND (p_company_id IS NULL OR s.company_id = p_company_id)
    RETURNING s.id INTO v_id;

    RETURN v_id;
END;
$function$;
