-- ../functions/20261116_171032_get_site_assignments.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:32 MST 2026
--
-- Función get_site_assignments.

CREATE OR REPLACE FUNCTION public.get_site_assignments(
    p_id uuid,
    p_company_id uuid DEFAULT NULL
) RETURNS TABLE(
    assignment_id uuid,
    user_id uuid,
    full_name character varying,
    email character varying,
    user_status smallint,
    assigned_by_id uuid,
    assigned_by_name character varying,
    assigned_at timestamp with time zone
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT sa.id, sa.user_id, u.full_name, u.email, u.status, sa.assigned_by_id, b.full_name, sa.assigned_at
      FROM public.site_assignments sa
      JOIN public.sites s ON s.id = sa.site_id
      JOIN public.users u ON u.id = sa.user_id
      JOIN public.users b ON b.id = sa.assigned_by_id
     WHERE sa.site_id = p_id
       AND (p_company_id IS NULL OR s.company_id = p_company_id)
     ORDER BY u.full_name;
END;
$function$;
