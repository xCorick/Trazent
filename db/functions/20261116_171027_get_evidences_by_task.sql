-- ../functions/20261116_171027_get_evidences_by_task.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:27 MST 2026
--
-- Función get_evidences_by_task.

CREATE OR REPLACE FUNCTION public.get_evidences_by_task(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_user_id uuid DEFAULT NULL
) RETURNS TABLE(
    evidence_id uuid,
    client_id uuid,
    uploaded_by_id uuid,
    uploaded_by_name character varying,
    file_key character varying,
    evidence_comment character varying,
    latitude double precision,
    longitude double precision,
    captured_at_device timestamp with time zone,
    uploaded_at timestamp with time zone,
    review_status smallint,
    reviewer_id uuid,
    reviewer_name character varying,
    reviewer_comment character varying,
    reviewed_at timestamp with time zone
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT e.id, e.client_id, e.user_id, u.full_name, e.file_key, e.comment, e.latitude, e.longitude,
           e.captured_at_device, e.uploaded_at, e.review_status, e.reviewer_id, r.full_name,
           e.reviewer_comment, e.reviewed_at
      FROM public.evidences e
      JOIN public.tasks t ON t.id = e.task_id
      JOIN public.users u ON u.id = e.user_id
      LEFT JOIN public.users r ON r.id = e.reviewer_id
     WHERE e.task_id = p_id
       AND (p_company_id IS NULL OR t.company_id = p_company_id)
       AND (p_user_id IS NULL OR t.assigned_to_id = p_user_id)
     ORDER BY e.uploaded_at DESC;
END;
$function$;
