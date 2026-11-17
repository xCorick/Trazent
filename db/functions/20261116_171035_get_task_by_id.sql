-- ../functions/20261116_171035_get_task_by_id.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:35 MST 2026
--
-- Función get_task_by_id.

CREATE OR REPLACE FUNCTION public.get_task_by_id(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_user_id uuid DEFAULT NULL
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
    assigned_to_id uuid,
    assigned_to_name character varying,
    created_by_id uuid,
    created_by_name character varying,
    evidence_count integer,
    pending_evidences integer,
    approved_evidences integer,
    rejected_evidences integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
    LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT t.id, t.title, t.description, t.due_at, t.status, t.completed_at,
           (t.status IN (0, 1) AND t.due_at IS NOT NULL AND t.due_at < now()),
           t.site_id, s.name, s.address, s.latitude, s.longitude,
           t.assigned_to_id, ua.full_name, t.created_by_id, uc.full_name,
           ev.total, ev.pending, ev.approved, ev.rejected,
           t.created_at, t.updated_at
      FROM public.tasks t
      JOIN public.sites s ON s.id = t.site_id
      JOIN public.users ua ON ua.id = t.assigned_to_id
      JOIN public.users uc ON uc.id = t.created_by_id
      LEFT JOIN LATERAL (
            SELECT count(*)::integer AS total,
                   (count(*) FILTER (WHERE e.review_status = 0))::integer AS pending,
                   (count(*) FILTER (WHERE e.review_status = 1))::integer AS approved,
                   (count(*) FILTER (WHERE e.review_status = 2))::integer AS rejected
              FROM public.evidences e
             WHERE e.task_id = t.id
           ) ev ON TRUE
     WHERE t.id = p_id
       AND (p_company_id IS NULL OR t.company_id = p_company_id)
       AND (p_user_id IS NULL OR t.assigned_to_id = p_user_id);
END;
$function$;
