-- ../functions/20261116_171002_assign_site_user.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:02 MST 2026
--
-- Función assign_site_user.

CREATE OR REPLACE FUNCTION public.assign_site_user(
    p_site_id uuid,
    p_user_id uuid,
    p_assigned_by_id uuid,
    p_company_id uuid DEFAULT NULL
) RETURNS uuid
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO public.site_assignments (site_id, user_id, assigned_by_id)
    VALUES (p_site_id, p_user_id, p_assigned_by_id)
    ON CONFLICT (site_id, user_id) DO NOTHING
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
        SELECT sa.id INTO v_id
          FROM public.site_assignments sa
         WHERE sa.site_id = p_site_id AND sa.user_id = p_user_id;
    END IF;

    RETURN v_id;
END;
$function$;
