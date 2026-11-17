-- ../migrations/20261116_170001_create_table_companies.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:01 MST 2026
--
-- Tabla companies: Empresas que contratan personal externo. Es la raíz multiempresa: casi todos los registros pertenecen a una empresa y se filtran por company_id.

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(150) NOT NULL,
    plan smallint DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT ck_companies_plan CHECK ((plan = ANY (ARRAY[0, 1, 2])))
);

COMMENT ON TABLE public.companies IS 'Empresas que contratan personal externo. Es la raíz multiempresa: casi todos los registros pertenecen a una empresa y se filtran por company_id.';

COMMENT ON COLUMN public.companies.id IS 'Identificador único de la empresa.';
COMMENT ON COLUMN public.companies.name IS 'Nombre comercial de la empresa.';
COMMENT ON COLUMN public.companies.plan IS 'Plan contratado. Enum: 0 Free, 1 Pro, 2 Enterprise. En el MVP no se cobra; queda preparado para el modelo de suscripción.';
COMMENT ON COLUMN public.companies.is_active IS 'Permite desactivar una empresa sin borrar su información.';
COMMENT ON COLUMN public.companies.created_at IS 'Fecha de alta de la empresa.';
COMMENT ON COLUMN public.companies.updated_at IS 'Fecha de la última modificación (la actualiza un trigger).';

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT pk_companies PRIMARY KEY (id);

CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
