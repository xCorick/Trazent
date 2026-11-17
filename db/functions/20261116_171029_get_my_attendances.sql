-- ../functions/20261116_171029_get_my_attendances.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:29 MST 2026
--
-- Función get_my_attendances.

CREATE OR REPLACE FUNCTION public.get_my_attendances(
    p_id uuid,
    p_from timestamp with time zone DEFAULT NULL,
    p_to timestamp with time zone DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
) RETURNS TABLE(
    attendance_id uuid,
    client_id uuid,
    site_id uuid,
    site_name character varying,
    attendance_type smallint,
    captured_at_device timestamp with time zone,
    received_at_server timestamp with time zone,
    geofence_status smallint,
    distance_meters real,
    requires_review boolean,
    review_status smallint,
    verification_method smallint,
    reviewer_comment character varying,
    sync_status smallint,
    photo_key character varying,
    total_count bigint
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT a.id, a.client_id, a.site_id, s.name, a.type, a.captured_at_device, a.received_at_server,
           a.geofence_status, a.distance_meters, a.requires_review, a.review_status,
           a.verification_method, a.reviewer_comment, a.sync_status, a.photo_key,
           count(*) OVER ()
      FROM public.attendances a
      JOIN public.sites s ON s.id = a.site_id
     WHERE a.user_id = p_id
       AND (p_from IS NULL OR a.received_at_server >= p_from)
       AND (p_to IS NULL OR a.received_at_server < p_to)
     ORDER BY a.received_at_server DESC
     LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 200)
    OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$function$;
