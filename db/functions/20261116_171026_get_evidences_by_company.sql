-- ../functions/20261116_171026_get_evidences_by_company.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:26 MST 2026
--
-- Función get_evidences_by_company.

CREATE OR REPLACE FUNCTION public.get_evidences_by_company(
    p_company_id uuid,
    p_review_status smallint DEFAULT NULL,
    p_task_id uuid DEFAULT NULL,
    p_site_id uuid DEFAULT NULL,
    p_user_id uuid DEFAULT NULL,
    p_from timestamp with time zone DEFAULT NULL,
    p_to timestamp with time zone DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
) RETURNS TABLE(
    evidence_id uuid,
    task_id uuid,
    task_title character varying,
    site_id uuid,
    site_name character varying,
    uploaded_by_id uuid,
    uploaded_by_name character varying,
    file_key character varying,
    evidence_comment character varying,
    captured_at_device timestamp with time zone,
    uploaded_at timestamp with time zone,
    review_status smallint,
    reviewer_id uuid,
    reviewer_comment character varying,
    reviewed_at timestamp with time zone,
    total_count bigint
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT e.id, e.task_id, t.title, t.site_id, s.name, e.user_id, u.full_name, e.file_key, e.comment,
           e.captured_at_device, e.uploaded_at, e.review_status, e.reviewer_id, e.reviewer_comment,
           e.reviewed_at, count(*) OVER ()
      FROM public.evidences e
      JOIN public.tasks t ON t.id = e.task_id
      JOIN public.sites s ON s.id = t.site_id
      JOIN public.users u ON u.id = e.user_id
     WHERE e.company_id = p_company_id
       AND (p_review_status IS NULL OR e.review_status = p_review_status)
       AND (p_task_id IS NULL OR e.task_id = p_task_id)
       AND (p_site_id IS NULL OR t.site_id = p_site_id)
       AND (p_user_id IS NULL OR e.user_id = p_user_id)
       AND (p_from IS NULL OR e.uploaded_at >= p_from)
       AND (p_to IS NULL OR e.uploaded_at < p_to)
     ORDER BY e.uploaded_at DESC
     LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 500)
    OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$function$;
