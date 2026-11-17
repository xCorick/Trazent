-- ../migrations/20261116_170008_create_table_tasks.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:08 MST 2026
--
-- Tabla tasks: Tareas que un supervisor o administrador asigna a un contratista en un sitio. El contratista las consulta en la app y entrega evidencias de su realización.

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    site_id uuid NOT NULL,
    assigned_to_id uuid NOT NULL,
    created_by_id uuid NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    due_at timestamp with time zone,
    status smallint DEFAULT 0 NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT ck_tasks_status CHECK ((status = ANY (ARRAY[0, 1, 2, 3])))
);

COMMENT ON TABLE public.tasks IS 'Tareas que un supervisor o administrador asigna a un contratista en un sitio. El contratista las consulta en la app y entrega evidencias de su realización.';

COMMENT ON COLUMN public.tasks.id IS 'Identificador único de la tarea.';
COMMENT ON COLUMN public.tasks.company_id IS 'Empresa de la tarea; duplicado a propósito para el filtro global por empresa.';
COMMENT ON COLUMN public.tasks.site_id IS 'Sitio donde debe realizarse la tarea.';
COMMENT ON COLUMN public.tasks.assigned_to_id IS 'Contratista responsable de la tarea.';
COMMENT ON COLUMN public.tasks.created_by_id IS 'Supervisor o administrador que creó la tarea.';
COMMENT ON COLUMN public.tasks.title IS 'Título corto de la tarea, p. ej. "Limpieza área B".';
COMMENT ON COLUMN public.tasks.description IS 'Instrucciones detalladas para el contratista.';
COMMENT ON COLUMN public.tasks.due_at IS 'Fecha límite para completar la tarea (opcional).';
COMMENT ON COLUMN public.tasks.status IS 'Estado. Enum: 0 Pending, 1 InProgress, 2 Completed, 3 Cancelled.';
COMMENT ON COLUMN public.tasks.completed_at IS 'Fecha en que la tarea se marcó como completada.';
COMMENT ON COLUMN public.tasks.created_at IS 'Fecha de creación de la tarea.';
COMMENT ON COLUMN public.tasks.updated_at IS 'Fecha de la última modificación (la actualiza un trigger).';

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT pk_tasks PRIMARY KEY (id);

CREATE INDEX ix_tasks_assigned_status ON public.tasks USING btree (assigned_to_id, status);

CREATE INDEX ix_tasks_company_status ON public.tasks USING btree (company_id, status);

CREATE INDEX ix_tasks_created_by_id ON public.tasks USING btree (created_by_id);

CREATE INDEX ix_tasks_site_id ON public.tasks USING btree (site_id);

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to_id) REFERENCES public.users(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_site FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE RESTRICT;
