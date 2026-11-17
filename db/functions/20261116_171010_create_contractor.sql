-- ../functions/20261116_171010_create_contractor.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:10 MST 2026
--
-- Función create_contractor.

CREATE OR REPLACE FUNCTION public.create_contractor(
    p_company_id uuid,
    p_full_name character varying,
    p_email character varying,
    p_user_name character varying,
    p_password_hash text,
    p_security_stamp text,
    p_concurrency_stamp text,
    p_phone character varying DEFAULT NULL,
    p_specialty character varying DEFAULT NULL
) RETURNS TABLE(
    user_id uuid,
    contractor_id uuid
)
    LANGUAGE plpgsql
AS $function$
#variable_conflict use_column
DECLARE
    v_user_id uuid;
    v_contractor_id uuid;
    v_phone text := NULLIF(btrim(COALESCE(p_phone, '')), '');
    v_specialty text := NULLIF(btrim(COALESCE(p_specialty, '')), '');
BEGIN
    v_user_id := public.create_user(p_company_id, p_full_name, 2::smallint, p_email, p_user_name,
                                    p_password_hash, p_security_stamp, p_concurrency_stamp, v_phone);

    INSERT INTO public.contractors (user_id, company_id, phone, specialty)
    VALUES (v_user_id, p_company_id, v_phone, v_specialty)
    RETURNING id INTO v_contractor_id;

    RETURN QUERY SELECT v_user_id, v_contractor_id;
END;
$function$;
