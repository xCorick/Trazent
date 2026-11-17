-- ../functions/20261116_171001_evaluate_geofence.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:01 MST 2026
--
-- Función evaluate_geofence.

CREATE OR REPLACE FUNCTION public.evaluate_geofence(
    p_distance_meters double precision,
    p_radius_meters integer,
    p_accuracy_meters real,
    p_latitude double precision,
    p_longitude double precision,
    p_max_accuracy_meters real DEFAULT 100
) RETURNS smallint
    LANGUAGE plpgsql IMMUTABLE
AS $function$
BEGIN
    IF p_distance_meters IS NULL OR p_radius_meters IS NULL
       OR p_latitude IS NULL OR p_longitude IS NULL THEN
        RETURN 2;
    END IF;

    IF p_latitude = 0 AND p_longitude = 0 THEN
        RETURN 2;
    END IF;

    IF p_accuracy_meters IS NOT NULL AND p_accuracy_meters > p_max_accuracy_meters THEN
        RETURN 2;
    END IF;

    IF p_distance_meters <= p_radius_meters THEN
        RETURN 0;
    END IF;

    RETURN 1;
END;
$function$;
