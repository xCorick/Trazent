-- ../functions/20261116_171021_get_attendances_by_company.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:21 MST 2026
--
-- Función get_attendances_by_company.

CREATE OR REPLACE FUNCTION public.get_attendances_by_company(
    p_company_id uuid,
    p_site_id uuid DEFAULT NULL,
    p_user_id uuid DEFAULT NULL,
    p_from timestamp with time zone DEFAULT NULL,
    p_to timestamp with time zone DEFAULT NULL,
    p_geofence_status smallint DEFAULT NULL,
    p_review_status smallint DEFAULT NULL,
    p_requires_review boolean DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
) RETURNS TABLE(
    attendance_id uuid,
    user_id uuid,
    user_full_name character varying,
    site_id uuid,
    site_name character varying,
    attendance_type smallint,
    captured_at_device timestamp with time zone,
    received_at_server timestamp with time zone,
    latitude double precision,
    longitude double precision,
    accuracy_meters real,
    distance_meters real,
    is_mocked boolean,
    geofence_status smallint,
    requires_review boolean,
    review_status smallint,
    verification_method smallint,
    reviewer_id uuid,
    reviewer_comment character varying,
    reviewed_at timestamp with time zone,
    sync_status smallint,
    photo_key character varying,
    total_count bigint
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT a.id, a.user_id, u.full_name, a.site_id, s.name, a.type, a.captured_at_device,
           a.received_at_server, a.latitude, a.longitude, a.accuracy_meters, a.distance_meters,
           a.is_mocked, a.geofence_status, a.requires_review, a.review_status,
           a.verification_method, a.reviewer_id, a.reviewer_comment, a.reviewed_at,
           a.sync_status, a.photo_key, count(*) OVER ()
      FROM public.attendances a
      JOIN public.users u ON u.id = a.user_id
      JOIN public.sites s ON s.id = a.site_id
     WHERE a.company_id = p_company_id
       AND (p_site_id IS NULL OR a.site_id = p_site_id)
       AND (p_user_id IS NULL OR a.user_id = p_user_id)
       AND (p_from IS NULL OR a.received_at_server >= p_from)
       AND (p_to IS NULL OR a.received_at_server < p_to)
       AND (p_geofence_status IS NULL OR a.geofence_status = p_geofence_status)
       AND (p_review_status IS NULL OR a.review_status = p_review_status)
       AND (p_requires_review IS NULL OR a.requires_review = p_requires_review)
     ORDER BY a.received_at_server DESC
     LIMIT p_limit
    OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$function$;
