-- ../functions/20261116_171019_get_attendance_by_id.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:19 MST 2026
--
-- Función get_attendance_by_id.

CREATE OR REPLACE FUNCTION public.get_attendance_by_id(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_user_id uuid DEFAULT NULL
) RETURNS TABLE(
    attendance_id uuid,
    client_id uuid,
    user_id uuid,
    user_full_name character varying,
    site_id uuid,
    site_name character varying,
    site_latitude double precision,
    site_longitude double precision,
    site_radius_meters integer,
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
    reviewer_full_name character varying,
    reviewer_comment character varying,
    reviewed_at timestamp with time zone,
    sync_status smallint,
    photo_key character varying
)
    LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT a.id, a.client_id, a.user_id, u.full_name, a.site_id, s.name, s.latitude, s.longitude,
           s.radius_meters, a.type, a.captured_at_device, a.received_at_server, a.latitude,
           a.longitude, a.accuracy_meters, a.distance_meters, a.is_mocked, a.geofence_status,
           a.requires_review, a.review_status, a.verification_method, a.reviewer_id, r.full_name,
           a.reviewer_comment, a.reviewed_at, a.sync_status, a.photo_key
      FROM public.attendances a
      JOIN public.users u ON u.id = a.user_id
      JOIN public.sites s ON s.id = a.site_id
      LEFT JOIN public.users r ON r.id = a.reviewer_id
     WHERE a.id = p_id
       AND (p_company_id IS NULL OR a.company_id = p_company_id)
       AND (p_user_id IS NULL OR a.user_id = p_user_id);
END;
$function$;
