-- ../migrations/20261116_170002_create_table_users.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:02 MST 2026
--
-- Tabla users: Cuentas de acceso al sistema (administradores, supervisores y contratistas). Compatible con ASP.NET Core Identity; las cuentas las crea el administrador, no hay registro público.

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    full_name character varying(150) NOT NULL,
    role smallint NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    user_name character varying(256) NOT NULL,
    email character varying(256) NOT NULL,
    password_hash text NOT NULL,
    security_stamp text NOT NULL,
    concurrency_stamp text NOT NULL,
    phone_number character varying(20),
    lockout_end timestamp with time zone,
    access_failed_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT ck_users_access_failed_count CHECK ((access_failed_count >= 0)),
    CONSTRAINT ck_users_role CHECK ((role = ANY (ARRAY[0, 1, 2]))),
    CONSTRAINT ck_users_status CHECK ((status = ANY (ARRAY[0, 1, 2])))
);

COMMENT ON TABLE public.users IS 'Cuentas de acceso al sistema (administradores, supervisores y contratistas). Compatible con ASP.NET Core Identity; las cuentas las crea el administrador, no hay registro público.';

COMMENT ON COLUMN public.users.id IS 'Identificador único del usuario; es el "sub" del JWT.';
COMMENT ON COLUMN public.users.company_id IS 'Empresa a la que pertenece el usuario; se incluye como claim en el JWT para filtrar datos.';
COMMENT ON COLUMN public.users.full_name IS 'Nombre completo para mostrar en la app y en reportes.';
COMMENT ON COLUMN public.users.role IS 'Rol del usuario. Enum: 0 Admin, 1 Supervisor, 2 Contractor. Define los permisos en la API.';
COMMENT ON COLUMN public.users.status IS 'Estado de la cuenta. Enum: 0 Active, 1 Inactive, 2 Suspended. Solo los activos pueden iniciar sesión.';
COMMENT ON COLUMN public.users.user_name IS 'Nombre de usuario que exige Identity (normalmente igual al correo).';
COMMENT ON COLUMN public.users.email IS 'Correo con el que el usuario inicia sesión.';
COMMENT ON COLUMN public.users.password_hash IS 'Hash de la contraseña generado por Identity (nunca la contraseña en texto plano).';
COMMENT ON COLUMN public.users.security_stamp IS 'Valor que cambia al modificar credenciales; Identity lo usa para invalidar sesiones anteriores.';
COMMENT ON COLUMN public.users.concurrency_stamp IS 'Control de concurrencia optimista: evita que dos ediciones simultáneas se sobrescriban.';
COMMENT ON COLUMN public.users.phone_number IS 'Teléfono de contacto (opcional).';
COMMENT ON COLUMN public.users.lockout_end IS 'Hasta cuándo la cuenta está bloqueada por intentos fallidos; NULL si no está bloqueada.';
COMMENT ON COLUMN public.users.access_failed_count IS 'Intentos de inicio de sesión fallidos consecutivos; al llegar al límite se bloquea la cuenta.';
COMMENT ON COLUMN public.users.created_at IS 'Fecha de creación de la cuenta.';
COMMENT ON COLUMN public.users.updated_at IS 'Fecha de la última modificación (la actualiza un trigger).';

ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_users PRIMARY KEY (id);

CREATE INDEX ix_users_company_id ON public.users USING btree (company_id);

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;
