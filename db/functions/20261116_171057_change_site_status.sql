-- ../functions/20261116_171057_change_site_status.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:57 MST 2026
--
-- Función change_site_status (estaba en la base de desarrollo; no venía en el zip).

CREATE OR REPLACE FUNCTION public.change_site_status(p_id uuid, p_company_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_status boolean;
BEGIN
    UPDATE public.sites s
       SET is_active = NOT s.is_active
     WHERE s.id = p_id AND s.company_id = p_company_id
    RETURNING s.is_active INTO v_status;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'SITE_NOT_FOUND';
    END IF;
    RETURN v_status;
END;
$function$;
