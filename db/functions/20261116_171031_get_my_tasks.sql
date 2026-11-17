-- ../functions/20261116_171031_get_my_tasks.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:31 MST 2026
--
-- Función get_my_tasks.

CREATE OR REPLACE FUNCTION public.get_my_tasks(
    p_id uuid,
    p_status smallint DEFAULT NULL,
    p_limit integer DEFAULT 100,
    p_offset integer DEFAULT 0
) RETURNS TABLE(
    task_id uuid,
    title character varying,
    description text,
    due_at timestamp with time zone,
    task_status smallint,
    completed_at timestamp with time zone,
    is_overdue boolean,
    site_id uuid,
    site_name character varying,
    site_address character varying,
    site_latitude double precision,
    site_longitude double precision,
    evidence_count integer,
    pending_evidences integer,
    approved_evidences integer,
    rejected_evidences integer,
    last_rejection_comment character varying,
    created_at timestamp with time zone,
    total_count bigint
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT t.id, t.title, t.description, t.due_at, t.status, t.completed_at,
           (t.status IN (0, 1) AND t.due_at IS NOT NULL AND t.due_at < now()),
           t.site_id, s.name, s.address, s.latitude, s.longitude,
           ev.total, ev.pending, ev.approved, ev.rejected, ev.last_rejection,
           t.created_at, count(*) OVER ()
      FROM public.tasks t
      JOIN public.sites s ON s.id = t.site_id
      LEFT JOIN LATERAL (
            SELECT count(*)::integer AS total,
                   (count(*) FILTER (WHERE e.review_status = 0))::integer AS pending,
                   (count(*) FILTER (WHERE e.review_status = 1))::integer AS approved,
                   (count(*) FILTER (WHERE e.review_status = 2))::integer AS rejected,
                   (SELECT e2.reviewer_comment FROM public.evidences e2
                     WHERE e2.task_id = t.id AND e2.review_status = 2
                     ORDER BY e2.reviewed_at DESC LIMIT 1) AS last_rejection
              FROM public.evidences e
             WHERE e.task_id = t.id
           ) ev ON TRUE
     WHERE t.assigned_to_id = p_id
       AND ((p_status IS NULL AND t.status <> 3) OR t.status = p_status)
     ORDER BY (t.status IN (2, 3)), t.due_at NULLS LAST, t.created_at DESC
     LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 200)
    OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$function$;
