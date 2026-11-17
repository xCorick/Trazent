-- ../functions/20261116_171043_register_evidence.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:43 MST 2026
--
-- Función register_evidence.

CREATE OR REPLACE FUNCTION public.register_evidence(
    p_client_id uuid,
    p_user_id uuid,
    p_task_id uuid,
    p_file_key character varying,
    p_captured_at_device timestamp with time zone,
    p_comment character varying DEFAULT NULL,
    p_latitude double precision DEFAULT NULL,
    p_longitude double precision DEFAULT NULL
) RETURNS TABLE(
    evidence_id uuid,
    is_duplicate boolean,
    uploaded_at timestamp with time zone,
    task_status smallint
)
    LANGUAGE plpgsql
AS $function$
#variable_conflict use_column
DECLARE
    v_existing public.evidences%ROWTYPE;
    v_company_id uuid;
    v_task_status smallint;
    v_comment text := NULLIF(btrim(COALESCE(p_comment, '')), '');
    v_new_id uuid;
BEGIN
    SELECT * INTO v_existing FROM public.evidences e WHERE e.client_id = p_client_id;
    IF FOUND THEN
        RETURN QUERY
        SELECT v_existing.id, TRUE, v_existing.uploaded_at,
               (SELECT t.status FROM public.tasks t WHERE t.id = v_existing.task_id);
        RETURN;
    END IF;

    SELECT u.company_id INTO v_company_id
      FROM public.users u
     WHERE u.id = p_user_id;

    SELECT t.status INTO v_task_status
      FROM public.tasks t
     WHERE t.id = p_task_id;

    INSERT INTO public.evidences (client_id, company_id, task_id, user_id, file_key, comment,
                                  latitude, longitude, captured_at_device)
    VALUES (p_client_id, v_company_id, p_task_id, p_user_id, btrim(p_file_key), v_comment,
            p_latitude, p_longitude, p_captured_at_device)
    ON CONFLICT (client_id) DO NOTHING
    RETURNING id INTO v_new_id;

    IF v_new_id IS NULL THEN
        SELECT * INTO v_existing FROM public.evidences e WHERE e.client_id = p_client_id;
        RETURN QUERY SELECT v_existing.id, TRUE, v_existing.uploaded_at, v_task_status;
        RETURN;
    END IF;

    IF v_task_status = 0 THEN
        UPDATE public.tasks t SET status = 1, updated_at = NOW() WHERE t.id = p_task_id;
        v_task_status := 1;
    END IF;

    RETURN QUERY
    SELECT e.id, FALSE, e.uploaded_at, v_task_status
      FROM public.evidences e
     WHERE e.id = v_new_id;
END;
$function$;
