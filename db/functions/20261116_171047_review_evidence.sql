-- ../functions/20261116_171047_review_evidence.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:47 MST 2026
--
-- Función review_evidence.

CREATE OR REPLACE FUNCTION public.review_evidence(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_reviewer_id uuid DEFAULT NULL,
    p_review_status smallint DEFAULT 0,
    p_comment character varying DEFAULT NULL
) RETURNS TABLE(
    evidence_id uuid,
    contractor_user_id uuid,
    task_id uuid,
    task_title character varying,
    review_status smallint,
    reviewer_comment character varying,
    reviewed_at timestamp with time zone
)
    LANGUAGE plpgsql
AS $function$
#variable_conflict use_column
BEGIN
    UPDATE public.evidences e
       SET review_status = p_review_status,
           reviewer_id = p_reviewer_id,
           reviewer_comment = NULLIF(btrim(COALESCE(p_comment, '')), ''),
           reviewed_at = now()
     WHERE e.id = p_id
       AND (p_company_id IS NULL OR e.company_id = p_company_id);

    RETURN QUERY
    SELECT e.id, e.user_id, e.task_id, t.title, e.review_status, e.reviewer_comment, e.reviewed_at
      FROM public.evidences e
      JOIN public.tasks t ON t.id = e.task_id
     WHERE e.id = p_id;
END;
$function$;
