-- ../migrations/20261116_170012_create_index_ux_users_email.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:12 MST 2026
--
-- Evita correos repetidos sin importar mayúsculas: get_user_for_login busca por lower(email).

CREATE UNIQUE INDEX ux_users_email_lower ON public.users USING btree (lower((email)::text));
