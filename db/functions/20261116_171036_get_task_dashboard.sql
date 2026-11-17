-- ../functions/20261116_171036_get_task_dashboard.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:36 MST 2026
--
-- Función get_task_dashboard.

CREATE OR REPLACE FUNCTION public.get_task_dashboard(
    p_company_id uuid,
    p_from timestamp with time zone DEFAULT NULL,
    p_to timestamp with time zone DEFAULT NULL,
    p_site_id uuid DEFAULT NULL
) RETURNS TABLE(
    total_tasks bigint,
    pending_tasks bigint,
    in_progress_tasks bigint,
    completed_tasks bigint,
    cancelled_tasks bigint,
    overdue_tasks bigint,
    tasks_with_evidence bigint,
    pct_tasks_with_evidence numeric,
    total_evidences bigint,
    pending_evidences bigint,
    approved_evidences bigint,
    rejected_evidences bigint,
    pct_evidences_approved numeric
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    WITH scoped AS (
        SELECT t.id, t.status, t.due_at,
               EXISTS (SELECT 1 FROM public.evidences e0 WHERE e0.task_id = t.id) AS has_evidence
          FROM public.tasks t
         WHERE t.company_id = p_company_id
           AND (p_site_id IS NULL OR t.site_id = p_site_id)
           AND (p_from IS NULL OR t.created_at >= p_from)
           AND (p_to IS NULL OR t.created_at < p_to)
    ), tk AS (
        SELECT count(*) AS total,
               count(*) FILTER (WHERE s.status = 0) AS pending,
               count(*) FILTER (WHERE s.status = 1) AS in_progress,
               count(*) FILTER (WHERE s.status = 2) AS completed,
               count(*) FILTER (WHERE s.status = 3) AS cancelled,
               count(*) FILTER (WHERE s.status IN (0, 1) AND s.due_at IS NOT NULL AND s.due_at < now()) AS overdue,
               count(*) FILTER (WHERE s.status <> 3 AND s.has_evidence) AS with_evidence,
               count(*) FILTER (WHERE s.status <> 3) AS not_cancelled
          FROM scoped s
    ), ec AS (
        SELECT count(*) AS total,
               count(*) FILTER (WHERE e.review_status = 0) AS pending,
               count(*) FILTER (WHERE e.review_status = 1) AS approved,
               count(*) FILTER (WHERE e.review_status = 2) AS rejected
          FROM public.evidences e
          JOIN scoped s ON s.id = e.task_id
    )
    SELECT tk.total, tk.pending, tk.in_progress, tk.completed, tk.cancelled, tk.overdue,
           tk.with_evidence,
           round(100.0 * tk.with_evidence / NULLIF(tk.not_cancelled, 0), 2),
           ec.total, ec.pending, ec.approved, ec.rejected,
           round(100.0 * ec.approved / NULLIF(ec.approved + ec.rejected, 0), 2)
      FROM tk, ec;
END;
$function$;
