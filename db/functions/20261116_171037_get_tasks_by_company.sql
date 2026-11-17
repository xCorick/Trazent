-- ../functions/20261116_171037_get_tasks_by_company.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:37 MST 2026
--
-- Función get_tasks_by_company.

CREATE OR REPLACE FUNCTION public.get_tasks_by_company(
    p_company_id uuid,
    p_site_id uuid DEFAULT NULL,
    p_assigned_to_id uuid DEFAULT NULL,
    p_status smallint DEFAULT NULL,
    p_overdue_only boolean DEFAULT NULL,
    p_from timestamp with time zone DEFAULT NULL,
    p_to timestamp with time zone DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
) RETURNS TABLE(
    task_id uuid,
    title character varying,
    due_at timestamp with time zone,
    task_status smallint,
    completed_at timestamp with time zone,
    is_overdue boolean,
    site_id uuid,
    site_name character varying,
    assigned_to_id uuid,
    assigned_to_name character varying,
    evidence_count integer,
    pending_evidences integer,
    approved_evidences integer,
    rejected_evidences integer,
    created_at timestamp with time zone,
    total_count bigint
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT t.id, t.title, t.due_at, t.status, t.completed_at,
           (t.status IN (0, 1) AND t.due_at IS NOT NULL AND t.due_at < now()),
           t.site_id, s.name, t.assigned_to_id, ua.full_name,
           ev.total, ev.pending, ev.approved, ev.rejected,
           t.created_at, count(*) OVER ()
      FROM public.tasks t
      JOIN public.sites s ON s.id = t.site_id
      JOIN public.users ua ON ua.id = t.assigned_to_id
      LEFT JOIN LATERAL (
            SELECT count(*)::integer AS total,
                   (count(*) FILTER (WHERE e.review_status = 0))::integer AS pending,
                   (count(*) FILTER (WHERE e.review_status = 1))::integer AS approved,
                   (count(*) FILTER (WHERE e.review_status = 2))::integer AS rejected
              FROM public.evidences e
             WHERE e.task_id = t.id
           ) ev ON TRUE
     WHERE t.company_id = p_company_id
       AND (p_site_id IS NULL OR t.site_id = p_site_id)
       AND (p_assigned_to_id IS NULL OR t.assigned_to_id = p_assigned_to_id)
       AND (p_status IS NULL OR t.status = p_status)
       AND (p_overdue_only IS NOT TRUE
            OR (t.status IN (0, 1) AND t.due_at IS NOT NULL AND t.due_at < now()))
       AND (p_from IS NULL OR t.created_at >= p_from)
       AND (p_to IS NULL OR t.created_at < p_to)
     ORDER BY t.created_at DESC
     LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 500)
    OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$function$;
