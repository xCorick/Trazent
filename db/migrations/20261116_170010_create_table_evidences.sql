-- ../migrations/20261116_170010_create_table_evidences.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:10 MST 2026
--
-- Tabla evidences: Evidencias fotográficas que el contratista entrega para una tarea. El supervisor las aprueba o rechaza con un comentario.

CREATE TABLE public.evidences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    company_id uuid NOT NULL,
    task_id uuid NOT NULL,
    user_id uuid NOT NULL,
    file_key character varying(512) NOT NULL,
    comment character varying(500),
    latitude double precision,
    longitude double precision,
    captured_at_device timestamp with time zone NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    review_status smallint DEFAULT 0 NOT NULL,
    reviewer_id uuid,
    reviewer_comment character varying(500),
    reviewed_at timestamp with time zone,
    CONSTRAINT ck_evidences_coordinates CHECK (((latitude IS NULL) = (longitude IS NULL))),
    CONSTRAINT ck_evidences_latitude CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision)))),
    CONSTRAINT ck_evidences_longitude CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision)))),
    CONSTRAINT ck_evidences_review_status CHECK ((review_status = ANY (ARRAY[0, 1, 2]))),
    CONSTRAINT ck_evidences_reviewed_at CHECK (((review_status = 0) OR (reviewed_at IS NOT NULL)))
);

COMMENT ON TABLE public.evidences IS 'Evidencias fotográficas que el contratista entrega para una tarea. El supervisor las aprueba o rechaza con un comentario.';

COMMENT ON COLUMN public.evidences.id IS 'Identificador único de la evidencia en el servidor.';
COMMENT ON COLUMN public.evidences.client_id IS 'UUID generado por el teléfono antes de enviar; si la app reintenta el envío, el servidor detecta que ya existe y no la duplica.';
COMMENT ON COLUMN public.evidences.company_id IS 'Empresa de la evidencia; duplicado a propósito para el filtro global por empresa.';
COMMENT ON COLUMN public.evidences.task_id IS 'Tarea a la que corresponde la evidencia.';
COMMENT ON COLUMN public.evidences.user_id IS 'Contratista que subió la evidencia.';
COMMENT ON COLUMN public.evidences.file_key IS 'Llave del archivo en el almacenamiento S3 (R2/B2); la URL firmada se genera al consultarla.';
COMMENT ON COLUMN public.evidences.comment IS 'Nota del contratista sobre el trabajo realizado.';
COMMENT ON COLUMN public.evidences.latitude IS 'Latitud donde se tomó la foto (opcional).';
COMMENT ON COLUMN public.evidences.longitude IS 'Longitud donde se tomó la foto (opcional).';
COMMENT ON COLUMN public.evidences.captured_at_device IS 'Hora declarada por el teléfono al tomar la foto.';
COMMENT ON COLUMN public.evidences.uploaded_at IS 'Hora en que el servidor recibió la evidencia.';
COMMENT ON COLUMN public.evidences.review_status IS 'Estado de revisión. Enum: 0 Pending, 1 Approved, 2 Rejected.';
COMMENT ON COLUMN public.evidences.reviewer_id IS 'Supervisor que aprobó o rechazó la evidencia; NULL mientras esté pendiente.';
COMMENT ON COLUMN public.evidences.reviewer_comment IS 'Comentario del revisor, p. ej. el motivo del rechazo.';
COMMENT ON COLUMN public.evidences.reviewed_at IS 'Fecha en que se revisó la evidencia.';

ALTER TABLE ONLY public.evidences
    ADD CONSTRAINT pk_evidences PRIMARY KEY (id);

ALTER TABLE ONLY public.evidences
    ADD CONSTRAINT uq_evidences_client_id UNIQUE (client_id);

CREATE INDEX ix_evidences_company_review ON public.evidences USING btree (company_id, review_status);

CREATE INDEX ix_evidences_reviewer_id ON public.evidences USING btree (reviewer_id);

CREATE INDEX ix_evidences_task_id ON public.evidences USING btree (task_id);

CREATE INDEX ix_evidences_user_id ON public.evidences USING btree (user_id);

ALTER TABLE ONLY public.evidences
    ADD CONSTRAINT fk_evidences_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.evidences
    ADD CONSTRAINT fk_evidences_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.evidences
    ADD CONSTRAINT fk_evidences_task FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.evidences
    ADD CONSTRAINT fk_evidences_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;
