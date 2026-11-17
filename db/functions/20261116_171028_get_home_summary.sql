-- ../functions/20261116_171028_get_home_summary.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:28 MST 2026
--
-- Función get_home_summary.

CREATE OR REPLACE FUNCTION public.get_home_summary(
    p_id uuid,
    p_timezone text DEFAULT 'America/Hermosillo'
) RETURNS TABLE(
    last_attendance_type smallint,
    last_attendance_at timestamp with time zone,
    last_site_id uuid,
    last_site_name character varying,
    is_checked_in boolean,
    attendances_today integer,
    pending_tasks integer,
    in_progress_tasks integer,
    overdue_tasks integer
)
    LANGUAGE plpgsql STABLE
AS $function$
DECLARE
    v_day_start timestamp with time zone;
    v_type smallint;
    v_at timestamp with time zone;
    v_site_id uuid;
    v_site_name character varying;
BEGIN
    v_day_start := date_trunc('day', now() AT TIME ZONE p_timezone) AT TIME ZONE p_timezone;

    SELECT a.type, a.captured_at_device, a.site_id, s.name
      INTO v_type, v_at, v_site_id, v_site_name
      FROM public.attendances a
      JOIN public.sites s ON s.id = a.site_id
     WHERE a.user_id = p_id
     ORDER BY a.captured_at_device DESC, a.received_at_server DESC
     LIMIT 1;

    RETURN QUERY
    SELECT v_type, v_at, v_site_id, v_site_name,
           COALESCE(v_type = 0, FALSE),
           (SELECT count(*)::integer FROM public.attendances a
             WHERE a.user_id = p_id
               AND a.captured_at_device >= v_day_start
               AND a.captured_at_device < v_day_start + interval '1 day'),
           (SELECT count(*)::integer FROM public.tasks t
             WHERE t.assigned_to_id = p_id AND t.status = 0),
           (SELECT count(*)::integer FROM public.tasks t
             WHERE t.assigned_to_id = p_id AND t.status = 1),
           (SELECT count(*)::integer FROM public.tasks t
             WHERE t.assigned_to_id = p_id AND t.status IN (0, 1) AND t.due_at < now());
END;
$function$;
