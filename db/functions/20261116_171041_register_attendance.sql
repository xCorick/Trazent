-- ../functions/20261116_171041_register_attendance.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:41 MST 2026
--
-- Función register_attendance.

CREATE OR REPLACE FUNCTION public.register_attendance(
    p_client_id uuid,
    p_user_id uuid,
    p_site_id uuid,
    p_type smallint,
    p_captured_at_device timestamp with time zone,
    p_latitude double precision,
    p_longitude double precision,
    p_accuracy_meters real,
    p_is_mocked boolean,
    p_photo_key character varying,
    p_sync_status smallint DEFAULT 0
) RETURNS TABLE(
    attendance_id uuid,
    is_duplicate boolean,
    geofence_status smallint,
    distance_meters real,
    requires_review boolean,
    received_at_server timestamp with time zone
)
    LANGUAGE plpgsql
AS $function$
#variable_conflict use_column
DECLARE
    v_existing public.attendances%ROWTYPE;
    v_company_id uuid;
    v_site_lat double precision;
    v_site_lon double precision;
    v_site_radius integer;
    v_distance double precision;
    v_geofence smallint;
    v_new_id uuid;
BEGIN
    SELECT * INTO v_existing FROM public.attendances a WHERE a.client_id = p_client_id;
    IF FOUND THEN
        RETURN QUERY SELECT v_existing.id, TRUE, v_existing.geofence_status,
                            v_existing.distance_meters, v_existing.requires_review,
                            v_existing.received_at_server;
        RETURN;
    END IF;

    SELECT u.company_id INTO v_company_id
      FROM public.users u
     WHERE u.id = p_user_id;

    SELECT s.latitude, s.longitude, s.radius_meters
      INTO v_site_lat, v_site_lon, v_site_radius
      FROM public.sites s
     WHERE s.id = p_site_id;

    v_distance := public.calculate_distance_meters(p_latitude, p_longitude, v_site_lat, v_site_lon);
    v_geofence := public.evaluate_geofence(v_distance, v_site_radius, p_accuracy_meters, p_latitude, p_longitude);

    INSERT INTO public.attendances (
        client_id, company_id, user_id, site_id, type, captured_at_device,
        latitude, longitude, accuracy_meters, distance_meters, is_mocked,
        photo_key, geofence_status, sync_status
    ) VALUES (
        p_client_id, v_company_id, p_user_id, p_site_id, p_type, p_captured_at_device,
        p_latitude, p_longitude, p_accuracy_meters, v_distance::real, COALESCE(p_is_mocked, FALSE),
        btrim(p_photo_key), v_geofence, p_sync_status
    )
    ON CONFLICT (client_id) DO NOTHING
    RETURNING id INTO v_new_id;

    IF v_new_id IS NULL THEN
        SELECT * INTO v_existing FROM public.attendances a WHERE a.client_id = p_client_id;
        RETURN QUERY SELECT v_existing.id, TRUE, v_existing.geofence_status,
                            v_existing.distance_meters, v_existing.requires_review,
                            v_existing.received_at_server;
        RETURN;
    END IF;

    RETURN QUERY
    SELECT a.id, FALSE, a.geofence_status, a.distance_meters, a.requires_review, a.received_at_server
      FROM public.attendances a
     WHERE a.id = v_new_id;
END;
$function$;
