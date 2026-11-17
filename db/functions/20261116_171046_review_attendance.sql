-- ../functions/20261116_171046_review_attendance.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:46 MST 2026
--
-- Función review_attendance.

CREATE OR REPLACE FUNCTION public.review_attendance(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_reviewer_id uuid DEFAULT NULL,
    p_review_status smallint DEFAULT 0,
    p_verification_method smallint DEFAULT 0,
    p_comment character varying DEFAULT NULL
) RETURNS TABLE(
    attendance_id uuid,
    contractor_user_id uuid,
    review_status smallint,
    verification_method smallint,
    reviewed_at timestamp with time zone
)
    LANGUAGE plpgsql
AS $function$
#variable_conflict use_column
BEGIN
    UPDATE public.attendances a
       SET review_status = p_review_status,
           verification_method = p_verification_method,
           reviewer_id = p_reviewer_id,
           reviewer_comment = NULLIF(btrim(COALESCE(p_comment, '')), ''),
           reviewed_at = now()
     WHERE a.id = p_id
       AND (p_company_id IS NULL OR a.company_id = p_company_id);

    RETURN QUERY
    SELECT a.id, a.user_id, a.review_status, a.verification_method, a.reviewed_at
      FROM public.attendances a
     WHERE a.id = p_id;
END;
$function$;
