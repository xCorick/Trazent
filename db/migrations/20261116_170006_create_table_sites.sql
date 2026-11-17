-- ../migrations/20261116_170006_create_table_sites.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:06 MST 2026
--
-- Tabla sites: Sitios de trabajo (obras, edificios, instalaciones). Cada sitio define una geocerca circular: un punto central y un radio en metros.

CREATE TABLE public.sites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name character varying(150) NOT NULL,
    address character varying(255),
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    radius_meters integer DEFAULT 100 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT ck_sites_latitude CHECK (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision))),
    CONSTRAINT ck_sites_longitude CHECK (((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision))),
    CONSTRAINT ck_sites_radius CHECK ((radius_meters > 0))
);

COMMENT ON TABLE public.sites IS 'Sitios de trabajo (obras, edificios, instalaciones). Cada sitio define una geocerca circular: un punto central y un radio en metros.';

COMMENT ON COLUMN public.sites.id IS 'Identificador único del sitio.';
COMMENT ON COLUMN public.sites.company_id IS 'Empresa dueña del sitio.';
COMMENT ON COLUMN public.sites.name IS 'Nombre corto del sitio, p. ej. "Obra Centro".';
COMMENT ON COLUMN public.sites.address IS 'Dirección legible del sitio (opcional, solo informativa).';
COMMENT ON COLUMN public.sites.latitude IS 'Latitud del centro de la geocerca, en grados decimales.';
COMMENT ON COLUMN public.sites.longitude IS 'Longitud del centro de la geocerca, en grados decimales.';
COMMENT ON COLUMN public.sites.radius_meters IS 'Radio de la geocerca en metros; una asistencia más lejos se marca como fuera de geocerca.';
COMMENT ON COLUMN public.sites.is_active IS 'Permite ocultar sitios terminados sin borrar su historial.';
COMMENT ON COLUMN public.sites.created_at IS 'Fecha de alta del sitio.';
COMMENT ON COLUMN public.sites.updated_at IS 'Fecha de la última modificación (la actualiza un trigger).';

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT pk_sites PRIMARY KEY (id);

CREATE INDEX ix_sites_company_id ON public.sites USING btree (company_id);

CREATE TRIGGER trg_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT fk_sites_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;
