-- ../migrations/20261116_170007_create_table_site_assignments.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:07 MST 2026
--
-- Tabla site_assignments: Asignación de usuarios a sitios. Define en qué sitios puede registrar asistencia un contratista y qué sitios puede supervisar un supervisor.

CREATE TABLE public.site_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    user_id uuid NOT NULL,
    assigned_by_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.site_assignments IS 'Asignación de usuarios a sitios. Define en qué sitios puede registrar asistencia un contratista y qué sitios puede supervisar un supervisor.';

COMMENT ON COLUMN public.site_assignments.id IS 'Identificador único de la asignación.';
COMMENT ON COLUMN public.site_assignments.site_id IS 'Sitio asignado.';
COMMENT ON COLUMN public.site_assignments.user_id IS 'Contratista o supervisor asignado al sitio (único por sitio).';
COMMENT ON COLUMN public.site_assignments.assigned_by_id IS 'Administrador o supervisor que hizo la asignación (auditoría).';
COMMENT ON COLUMN public.site_assignments.assigned_at IS 'Fecha en que se hizo la asignación.';

ALTER TABLE ONLY public.site_assignments
    ADD CONSTRAINT pk_site_assignments PRIMARY KEY (id);

ALTER TABLE ONLY public.site_assignments
    ADD CONSTRAINT uq_site_assignments_site_user UNIQUE (site_id, user_id);

CREATE INDEX ix_site_assignments_assigned_by_id ON public.site_assignments USING btree (assigned_by_id);

CREATE INDEX ix_site_assignments_user_id ON public.site_assignments USING btree (user_id);

ALTER TABLE ONLY public.site_assignments
    ADD CONSTRAINT fk_site_assignments_assigned_by FOREIGN KEY (assigned_by_id) REFERENCES public.users(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.site_assignments
    ADD CONSTRAINT fk_site_assignments_site FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.site_assignments
    ADD CONSTRAINT fk_site_assignments_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
