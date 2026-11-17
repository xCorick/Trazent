-- ../functions/20261116_171014_create_user.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:14 MST 2026
--
-- Función create_user.

CREATE OR REPLACE FUNCTION public.create_user(
    p_company_id uuid,
    p_full_name character varying,
    p_role smallint,
    p_email character varying,
    p_user_name character varying,
    p_password_hash text,
    p_security_stamp text,
    p_concurrency_stamp text,
    p_phone_number character varying DEFAULT NULL
) RETURNS uuid
    LANGUAGE plpgsql
AS $function$
DECLARE
    v_id uuid;
    v_full_name text := NULLIF(btrim(COALESCE(p_full_name, '')), '');
    v_email text := NULLIF(btrim(COALESCE(p_email, '')), '');
    v_user_name text := NULLIF(btrim(COALESCE(p_user_name, '')), '');
    v_phone text := NULLIF(btrim(COALESCE(p_phone_number, '')), '');
BEGIN
    INSERT INTO public.users (company_id, full_name, role, email, user_name, password_hash,
                              security_stamp, concurrency_stamp, phone_number)
    VALUES (p_company_id, v_full_name, p_role, v_email, v_user_name, p_password_hash,
            p_security_stamp, p_concurrency_stamp, v_phone)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$function$;
