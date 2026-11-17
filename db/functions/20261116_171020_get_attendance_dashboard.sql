-- ../functions/20261116_171020_get_attendance_dashboard.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:20 MST 2026
--
-- Función get_attendance_dashboard.

CREATE OR REPLACE FUNCTION public.get_attendance_dashboard(
    p_company_id uuid,
    p_from timestamp with time zone DEFAULT NULL,
    p_to timestamp with time zone DEFAULT NULL,
    p_site_id uuid DEFAULT NULL
) RETURNS TABLE(
    total_attendances bigint,
    check_ins bigint,
    check_outs bigint,
    inside_geofence bigint,
    outside_geofence bigint,
    unknown_geofence bigint,
    mocked_location bigint,
    requires_review bigint,
    pending_review bigint,
    accepted bigint,
    rejected bigint,
    accepted_app_only bigint,
    accepted_in_person bigint,
    accepted_other bigint,
    pct_accepted_app_only numeric,
    synced_from_offline bigint
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT count(*),
           count(*) FILTER (WHERE a.type = 0),
           count(*) FILTER (WHERE a.type = 1),
           count(*) FILTER (WHERE a.geofence_status = 0),
           count(*) FILTER (WHERE a.geofence_status = 1),
           count(*) FILTER (WHERE a.geofence_status = 2),
           count(*) FILTER (WHERE a.is_mocked),
           count(*) FILTER (WHERE a.requires_review),
           count(*) FILTER (WHERE a.review_status = 0),
           count(*) FILTER (WHERE a.review_status = 1),
           count(*) FILTER (WHERE a.review_status = 2),
           count(*) FILTER (WHERE a.review_status = 1 AND a.verification_method = 0),
           count(*) FILTER (WHERE a.review_status = 1 AND a.verification_method = 1),
           count(*) FILTER (WHERE a.review_status = 1 AND a.verification_method = 2),
           round(100.0 * count(*) FILTER (WHERE a.review_status = 1 AND a.verification_method = 0)
                 / NULLIF(count(*) FILTER (WHERE a.review_status = 1), 0), 2),
           count(*) FILTER (WHERE a.sync_status = 1)
      FROM public.attendances a
     WHERE a.company_id = p_company_id
       AND (p_site_id IS NULL OR a.site_id = p_site_id)
       AND (p_from IS NULL OR a.received_at_server >= p_from)
       AND (p_to IS NULL OR a.received_at_server < p_to);
END;
$function$;
