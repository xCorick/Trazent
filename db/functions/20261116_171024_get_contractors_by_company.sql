-- ../functions/20261116_171024_get_contractors_by_company.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:24 MST 2026
--
-- Función get_contractors_by_company.

CREATE OR REPLACE FUNCTION public.get_contractors_by_company(
    p_company_id uuid,
    p_status smallint DEFAULT NULL
) RETURNS TABLE(
    contractor_id uuid,
    user_id uuid,
    full_name character varying,
    email character varying,
    phone character varying,
    specialty character varying,
    contractor_status smallint,
    user_status smallint,
    assigned_sites integer,
    created_at timestamp with time zone
)
    LANGUAGE plpgsql STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT ct.id, ct.user_id, u.full_name, u.email, COALESCE(ct.phone, u.phone_number), ct.specialty,
           ct.status, u.status,
           (SELECT count(*)::integer FROM public.site_assignments sa WHERE sa.user_id = ct.user_id),
           ct.created_at
      FROM public.contractors ct
      JOIN public.users u ON u.id = ct.user_id
     WHERE ct.company_id = p_company_id
       AND (p_status IS NULL OR ct.status = p_status)
     ORDER BY u.full_name;
END;
$function$;
