-- ../migrations/20261116_170003_create_table_contractors.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:03 MST 2026
--
-- Tabla contractors: Perfil adicional de los usuarios con rol Contractor (relación 1 a 1 con users). Guarda datos laborales que no aplican a administradores ni supervisores.

CREATE TABLE public.contractors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    phone character varying(20),
    specialty character varying(100),
    status smallint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT ck_contractors_status CHECK ((status = ANY (ARRAY[0, 1, 2])))
);

COMMENT ON TABLE public.contractors IS 'Perfil adicional de los usuarios con rol Contractor (relación 1 a 1 con users). Guarda datos laborales que no aplican a administradores ni supervisores.';

COMMENT ON COLUMN public.contractors.id IS 'Identificador único del perfil de contratista.';
COMMENT ON COLUMN public.contractors.user_id IS 'Cuenta de acceso del contratista; única porque cada usuario tiene a lo sumo un perfil.';
COMMENT ON COLUMN public.contractors.company_id IS 'Empresa para la que trabaja el contratista (permite filtrar sin pasar por users).';
COMMENT ON COLUMN public.contractors.phone IS 'Teléfono de contacto del contratista.';
COMMENT ON COLUMN public.contractors.specialty IS 'Tipo de servicio que presta: limpieza, seguridad, construcción, mantenimiento, etc.';
COMMENT ON COLUMN public.contractors.status IS 'Estado laboral. Enum: 0 Active, 1 Inactive, 2 Suspended.';
COMMENT ON COLUMN public.contractors.created_at IS 'Fecha de registro del contratista.';
COMMENT ON COLUMN public.contractors.updated_at IS 'Fecha de la última modificación (la actualiza un trigger).';

ALTER TABLE ONLY public.contractors
    ADD CONSTRAINT pk_contractors PRIMARY KEY (id);

ALTER TABLE ONLY public.contractors
    ADD CONSTRAINT uq_contractors_user_id UNIQUE (user_id);

CREATE INDEX ix_contractors_company_id ON public.contractors USING btree (company_id);

CREATE TRIGGER trg_contractors_updated_at BEFORE UPDATE ON public.contractors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE ONLY public.contractors
    ADD CONSTRAINT fk_contractors_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.contractors
    ADD CONSTRAINT fk_contractors_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
