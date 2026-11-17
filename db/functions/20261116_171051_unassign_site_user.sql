-- ../functions/20261116_171051_unassign_site_user.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:51 MST 2026
--
-- Función unassign_site_user.

CREATE OR REPLACE FUNCTION public.unassign_site_user(
    p_site_id uuid,
    p_user_id uuid,
    p_company_id uuid DEFAULT NULL
) RETURNS boolean
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted integer;
BEGIN
    DELETE FROM public.site_assignments sa
     WHERE sa.site_id = p_site_id AND sa.user_id = p_user_id;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    RETURN v_deleted > 0;
END;
$function$;
