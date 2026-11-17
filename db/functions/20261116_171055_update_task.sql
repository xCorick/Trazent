-- ../functions/20261116_171055_update_task.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:55 MST 2026
--
-- Función update_task.

CREATE OR REPLACE FUNCTION public.update_task(
    p_id uuid,
    p_company_id uuid DEFAULT NULL,
    p_title character varying DEFAULT NULL,
    p_description text DEFAULT NULL,
    p_due_at timestamp with time zone DEFAULT NULL,
    p_site_id uuid DEFAULT NULL,
    p_assigned_to_id uuid DEFAULT NULL
) RETURNS TABLE(
    task_id uuid,
    new_assignee_id uuid,
    assignee_changed boolean
)
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_assignee uuid;
BEGIN
    SELECT t.assigned_to_id INTO v_assignee
      FROM public.tasks t
     WHERE t.id = p_id;

    UPDATE public.tasks t
       SET title = COALESCE(p_title, t.title),
           description = COALESCE(p_description, t.description),
           due_at = COALESCE(p_due_at, t.due_at),
           site_id = COALESCE(p_site_id, t.site_id),
           assigned_to_id = COALESCE(p_assigned_to_id, t.assigned_to_id),
           updated_at = NOW()
     WHERE t.id = p_id
       AND (p_company_id IS NULL OR t.company_id = p_company_id);

    RETURN QUERY
    SELECT p_id,
           COALESCE(p_assigned_to_id, v_assignee),
           (p_assigned_to_id IS NOT NULL AND p_assigned_to_id <> v_assignee);
END;
$function$;
