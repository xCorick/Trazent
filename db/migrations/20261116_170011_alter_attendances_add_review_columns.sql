-- ../migrations/20261116_170011_alter_attendances_add_review_columns.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:11 MST 2026
--
-- Columnas de revisión de asistencias que usan review_attendance, get_attendance_*, get_my_attendances
-- y register_attendance. requires_review es una columna generada.

ALTER TABLE public.attendances
    ADD COLUMN requires_review boolean GENERATED ALWAYS AS ((geofence_status <> 0) OR is_mocked) STORED,
    ADD COLUMN review_status smallint DEFAULT 0 NOT NULL,
    ADD COLUMN verification_method smallint,
    ADD COLUMN reviewer_id uuid,
    ADD COLUMN reviewer_comment character varying(500),
    ADD COLUMN reviewed_at timestamp with time zone,
    ADD CONSTRAINT ck_attendances_review_status CHECK ((review_status = ANY (ARRAY[0, 1, 2]))),
    ADD CONSTRAINT ck_attendances_verification_method CHECK (((verification_method IS NULL) OR (verification_method = ANY (ARRAY[0, 1, 2])))),
    ADD CONSTRAINT ck_attendances_reviewed_at CHECK (((review_status = 0) OR (reviewed_at IS NOT NULL))),
    ADD CONSTRAINT fk_attendances_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.attendances.requires_review IS 'Calculada: TRUE si el registro quedó fuera de geocerca, con ubicación poco precisa o con GPS falso; el supervisor debe revisarlo.';
COMMENT ON COLUMN public.attendances.review_status IS 'Estado de la revisión del supervisor. Enum: 0 Pending, 1 Accepted, 2 Rejected.';
COMMENT ON COLUMN public.attendances.verification_method IS 'Cómo verificó el supervisor el registro. Enum: 0 AppEvidence (solo con la evidencia de la app), 1 InPerson (en persona), 2 Other.';
COMMENT ON COLUMN public.attendances.reviewer_id IS 'Supervisor o administrador que revisó el registro.';
COMMENT ON COLUMN public.attendances.reviewer_comment IS 'Comentario del revisor (motivo de rechazo o nota de verificación).';
COMMENT ON COLUMN public.attendances.reviewed_at IS 'Fecha de la revisión; obligatoria cuando review_status no es Pending.';

CREATE INDEX ix_attendances_reviewer_id ON public.attendances USING btree (reviewer_id);
CREATE INDEX ix_attendances_company_pending_review ON public.attendances USING btree (company_id, received_at_server DESC)
    WHERE (requires_review AND (review_status = 0));
