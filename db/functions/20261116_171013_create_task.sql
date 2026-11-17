-- ../functions/20261116_171013_create_task.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:13 MST 2026
--
-- Función create_task.

CREATE OR REPLACE FUNCTION public.create_task(
    p_company_id uuid,
    p_site_id uuid,
    p_assigned_to_id uuid,
    p_created_by_id uuid,
    p_title character varying,
    p_description text DEFAULT NULL,
    p_due_at timestamp with time zone DEFAULT NULL
) RETURNS uuid
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
    v_title text := NULLIF(btrim(COALESCE(p_title, '')), '');
BEGIN
    INSERT INTO public.tasks (company_id, site_id, assigned_to_id, created_by_id, title, description, due_at)
    VALUES (p_company_id, p_site_id, p_assigned_to_id, p_created_by_id, v_title,
            NULLIF(btrim(COALESCE(p_description, '')), ''), p_due_at)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$function$;
