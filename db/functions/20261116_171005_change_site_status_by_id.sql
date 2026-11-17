-- ../functions/20261116_171005_change_site_status_by_id.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:05 MST 2026
--
-- Función change_site_status_by_id.

CREATE OR REPLACE FUNCTION public.change_site_status_by_id(p_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE 
	status boolean;
BEGIN 
	UPDATE sites SET
	is_active = NOT is_active
WHERE id = p_id
 	RETURNING is_active INTO status;
	 return STATUS;
END;
$function$;
