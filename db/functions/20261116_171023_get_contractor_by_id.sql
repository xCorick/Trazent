-- ../functions/20261116_171023_get_contractor_by_id.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:23 MST 2026
--
-- Función get_contractor_by_id.

CREATE OR REPLACE FUNCTION public.get_contractor_by_id(
    p_id uuid,
    p_company_id uuid DEFAULT NULL
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
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
    LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT ct.id, ct.user_id, u.full_name, u.email, COALESCE(ct.phone, u.phone_number), ct.specialty,
           ct.status, u.status,
           (SELECT count(*)::integer FROM public.site_assignments sa WHERE sa.user_id = ct.user_id),
           ct.created_at, ct.updated_at
      FROM public.contractors ct
      JOIN public.users u ON u.id = ct.user_id
     WHERE ct.id = p_id
       AND (p_company_id IS NULL OR ct.company_id = p_company_id);
END;
$function$;
