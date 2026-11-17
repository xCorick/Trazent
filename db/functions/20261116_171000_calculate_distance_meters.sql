-- ../functions/20261116_171000_calculate_distance_meters.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:00 MST 2026
--
-- Función calculate_distance_meters.

CREATE OR REPLACE FUNCTION public.calculate_distance_meters(
    p_lat1 double precision,
    p_lon1 double precision,
    p_lat2 double precision,
    p_lon2 double precision
) RETURNS double precision
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
AS $function$
    SELECT 2 * 6371000.0 * asin(LEAST(1.0, sqrt(
        power(sin(radians(p_lat2 - p_lat1) / 2), 2) +
        cos(radians(p_lat1)) * cos(radians(p_lat2)) *
        power(sin(radians(p_lon2 - p_lon1) / 2), 2)
    )));
$function$;
