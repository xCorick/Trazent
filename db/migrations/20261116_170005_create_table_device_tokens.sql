-- ../migrations/20261116_170005_create_table_device_tokens.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:05 MST 2026
--
-- Tabla device_tokens: Tokens de notificaciones push (Expo Push) por dispositivo. Relacionan a cada usuario con los teléfonos donde inició sesión para saber a dónde enviar avisos.

CREATE TABLE public.device_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    platform smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_device_tokens_platform CHECK ((platform = ANY (ARRAY[0, 1, 2])))
);

COMMENT ON TABLE public.device_tokens IS 'Tokens de notificaciones push (Expo Push) por dispositivo. Relacionan a cada usuario con los teléfonos donde inició sesión para saber a dónde enviar avisos.';

COMMENT ON COLUMN public.device_tokens.id IS 'Identificador único del registro.';
COMMENT ON COLUMN public.device_tokens.user_id IS 'Usuario que tiene la sesión abierta en ese dispositivo; un usuario puede tener varios.';
COMMENT ON COLUMN public.device_tokens.token IS 'Token del dispositivo (ExponentPushToken[...]); único para no registrarlo dos veces.';
COMMENT ON COLUMN public.device_tokens.platform IS 'Plataforma del dispositivo. Enum: 0 Android, 1 iOS, 2 Web.';
COMMENT ON COLUMN public.device_tokens.created_at IS 'Fecha en que se registró el token.';
COMMENT ON COLUMN public.device_tokens.last_seen_at IS 'Última vez que la app reportó el token; sirve para limpiar tokens abandonados.';

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT pk_device_tokens PRIMARY KEY (id);

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT uq_device_tokens_token UNIQUE (token);

CREATE INDEX ix_device_tokens_user_id ON public.device_tokens USING btree (user_id);

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT fk_device_tokens_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
