-- ../migrations/20261116_170004_create_table_refresh_tokens.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:04 MST 2026
--
-- Tabla refresh_tokens: Tokens de renovación de sesión. Permiten obtener un nuevo JWT sin volver a iniciar sesión; son clave para el modo offline, donde el access token puede vencer antes de sincronizar.

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(128) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    replaced_by_id uuid,
    CONSTRAINT ck_refresh_tokens_expires CHECK ((expires_at > created_at))
);

COMMENT ON TABLE public.refresh_tokens IS 'Tokens de renovación de sesión. Permiten obtener un nuevo JWT sin volver a iniciar sesión; son clave para el modo offline, donde el access token puede vencer antes de sincronizar.';

COMMENT ON COLUMN public.refresh_tokens.id IS 'Identificador único del refresh token.';
COMMENT ON COLUMN public.refresh_tokens.user_id IS 'Usuario dueño de la sesión.';
COMMENT ON COLUMN public.refresh_tokens.token_hash IS 'Hash (p. ej. SHA-256) del token; nunca se guarda el token en claro por si se filtra la BD.';
COMMENT ON COLUMN public.refresh_tokens.expires_at IS 'Fecha a partir de la cual el token ya no sirve.';
COMMENT ON COLUMN public.refresh_tokens.created_at IS 'Fecha de emisión del token.';
COMMENT ON COLUMN public.refresh_tokens.revoked_at IS 'Fecha en que se invalidó (logout o rotación); NULL si sigue vigente.';
COMMENT ON COLUMN public.refresh_tokens.replaced_by_id IS 'Token que lo reemplazó al rotarse; permite detectar el reuso de un token robado e invalidar toda la cadena.';

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT pk_refresh_tokens PRIMARY KEY (id);

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash);

CREATE INDEX ix_refresh_tokens_replaced_by_id ON public.refresh_tokens USING btree (replaced_by_id);

CREATE INDEX ix_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_refresh_tokens_replaced_by FOREIGN KEY (replaced_by_id) REFERENCES public.refresh_tokens(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
