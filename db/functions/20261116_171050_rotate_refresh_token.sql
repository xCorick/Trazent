-- ../functions/20261116_171050_rotate_refresh_token.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:10:50 MST 2026
--
-- Función rotate_refresh_token.

CREATE OR REPLACE FUNCTION public.rotate_refresh_token(
    p_token_hash character varying,
    p_new_token_hash character varying,
    p_new_expires_at timestamp with time zone
) RETURNS TABLE(
    result_code text,
    owner_user_id uuid,
    new_token_id uuid
)
    LANGUAGE plpgsql
AS $function$
#variable_conflict use_column
DECLARE
    v_old public.refresh_tokens%ROWTYPE;
    v_active boolean;
    v_new_id uuid;
BEGIN
    SELECT * INTO v_old FROM public.refresh_tokens r WHERE r.token_hash = p_token_hash FOR UPDATE;
    IF NOT FOUND THEN
        RETURN QUERY SELECT 'NOT_FOUND'::text, NULL::uuid, NULL::uuid;
        RETURN;
    END IF;

    IF v_old.revoked_at IS NOT NULL THEN
        IF v_old.replaced_by_id IS NOT NULL THEN
            WITH RECURSIVE chain AS (
                SELECT r.id, r.replaced_by_id
                  FROM public.refresh_tokens r
                 WHERE r.id = v_old.id
                UNION
                SELECT r2.id, r2.replaced_by_id
                  FROM public.refresh_tokens r2
                  JOIN chain c ON r2.id = c.replaced_by_id
            )
            UPDATE public.refresh_tokens t
               SET revoked_at = now()
             WHERE t.id IN (SELECT c.id FROM chain c)
               AND t.revoked_at IS NULL;
            RETURN QUERY SELECT 'REUSED'::text, v_old.user_id, NULL::uuid;
        ELSE
            RETURN QUERY SELECT 'REVOKED'::text, v_old.user_id, NULL::uuid;
        END IF;
        RETURN;
    END IF;

    IF v_old.expires_at <= now() THEN
        RETURN QUERY SELECT 'EXPIRED'::text, v_old.user_id, NULL::uuid;
        RETURN;
    END IF;

    SELECT (u.status = 0 AND c.is_active) INTO v_active
      FROM public.users u
      JOIN public.companies c ON c.id = u.company_id
     WHERE u.id = v_old.user_id;
    IF v_active IS NOT TRUE THEN
        UPDATE public.refresh_tokens r SET revoked_at = now() WHERE r.id = v_old.id;
        RETURN QUERY SELECT 'USER_NOT_ACTIVE'::text, v_old.user_id, NULL::uuid;
        RETURN;
    END IF;

    INSERT INTO public.refresh_tokens (user_id, token_hash, expires_at)
    VALUES (v_old.user_id, p_new_token_hash, p_new_expires_at)
    RETURNING id INTO v_new_id;

    UPDATE public.refresh_tokens r
       SET revoked_at = now(), replaced_by_id = v_new_id
     WHERE r.id = v_old.id;

    RETURN QUERY SELECT 'OK'::text, v_old.user_id, v_new_id;
END;
$function$;
