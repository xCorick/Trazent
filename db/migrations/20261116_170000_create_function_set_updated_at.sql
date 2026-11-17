-- ../migrations/20261116_170000_create_function_set_updated_at.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:00 MST 2026
--
-- Función de trigger que actualiza updated_at. Va como migración (no en /functions)
-- porque los triggers de las tablas la necesitan antes de que corran las funciones.

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.set_updated_at() IS 'Trigger genérico: asigna la hora actual a updated_at cada vez que se modifica una fila.';
