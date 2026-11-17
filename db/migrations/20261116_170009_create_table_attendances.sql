-- ../migrations/20261116_170009_create_table_attendances.sql
-- Author: Adrián González Serrano
-- Date: Mon Nov 16 17:00:09 MST 2026
--
-- Tabla attendances: Registros de entrada y salida de los contratistas. Cada registro guarda foto, ubicación, hora del dispositivo y hora del servidor, y el resultado de la validación de geocerca. Es la tabla central del sistema.

CREATE TABLE public.attendances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    site_id uuid NOT NULL,
    type smallint NOT NULL,
    captured_at_device timestamp with time zone NOT NULL,
    received_at_server timestamp with time zone DEFAULT now() NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    accuracy_meters real,
    distance_meters real NOT NULL,
    is_mocked boolean DEFAULT false NOT NULL,
    photo_key character varying(512) NOT NULL,
    geofence_status smallint NOT NULL,
    sync_status smallint DEFAULT 0 NOT NULL,
    CONSTRAINT ck_attendances_accuracy CHECK (((accuracy_meters IS NULL) OR (accuracy_meters >= (0)::double precision))),
    CONSTRAINT ck_attendances_distance CHECK ((distance_meters >= (0)::double precision)),
    CONSTRAINT ck_attendances_geofence_status CHECK ((geofence_status = ANY (ARRAY[0, 1, 2]))),
    CONSTRAINT ck_attendances_latitude CHECK (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision))),
    CONSTRAINT ck_attendances_longitude CHECK (((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision))),
    CONSTRAINT ck_attendances_sync_status CHECK ((sync_status = ANY (ARRAY[0, 1]))),
    CONSTRAINT ck_attendances_type CHECK ((type = ANY (ARRAY[0, 1])))
);

COMMENT ON TABLE public.attendances IS 'Registros de entrada y salida de los contratistas. Cada registro guarda foto, ubicación, hora del dispositivo y hora del servidor, y el resultado de la validación de geocerca. Es la tabla central del sistema.';

COMMENT ON COLUMN public.attendances.id IS 'Identificador único del registro en el servidor.';
COMMENT ON COLUMN public.attendances.client_id IS 'UUID generado por el teléfono al capturar el registro; evita duplicados cuando la app reintenta el envío o sincroniza registros offline.';
COMMENT ON COLUMN public.attendances.company_id IS 'Empresa del registro; duplicado a propósito para filtrar por empresa sin hacer join con sites.';
COMMENT ON COLUMN public.attendances.user_id IS 'Contratista que registró la asistencia.';
COMMENT ON COLUMN public.attendances.site_id IS 'Sitio de trabajo donde se registró.';
COMMENT ON COLUMN public.attendances.type IS 'Tipo de registro. Enum: 0 CheckIn (entrada), 1 CheckOut (salida).';
COMMENT ON COLUMN public.attendances.captured_at_device IS 'Hora declarada por el teléfono al tomar la foto; importante en registros offline, pero no es confiable por sí sola.';
COMMENT ON COLUMN public.attendances.received_at_server IS 'Hora en que el servidor recibió el registro; es la hora confiable para reportes.';
COMMENT ON COLUMN public.attendances.latitude IS 'Latitud reportada por el GPS del teléfono.';
COMMENT ON COLUMN public.attendances.longitude IS 'Longitud reportada por el GPS del teléfono.';
COMMENT ON COLUMN public.attendances.accuracy_meters IS 'Precisión del GPS en metros (±); una precisión mala hace dudosa la validación de geocerca.';
COMMENT ON COLUMN public.attendances.distance_meters IS 'Distancia calculada por el servidor entre la ubicación reportada y el centro del sitio.';
COMMENT ON COLUMN public.attendances.is_mocked IS 'TRUE si Android indicó que la ubicación proviene de una app de GPS falso.';
COMMENT ON COLUMN public.attendances.photo_key IS 'Llave del archivo de la foto en el almacenamiento S3 (R2/B2); la URL firmada se genera al consultarla.';
COMMENT ON COLUMN public.attendances.geofence_status IS 'Resultado de la geocerca. Enum: 0 Inside, 1 Outside, 2 Unknown (p. ej. sin coordenadas fiables).';
COMMENT ON COLUMN public.attendances.sync_status IS 'Cómo llegó el registro. Enum: 0 Online (enviado al momento), 1 SyncedFromOffline (capturado sin conexión y sincronizado después).';

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT pk_attendances PRIMARY KEY (id);

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT uq_attendances_client_id UNIQUE (client_id);

CREATE INDEX ix_attendances_company_received ON public.attendances USING btree (company_id, received_at_server DESC);

CREATE INDEX ix_attendances_site_received ON public.attendances USING btree (site_id, received_at_server DESC);

CREATE INDEX ix_attendances_user_captured ON public.attendances USING btree (user_id, captured_at_device DESC);

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT fk_attendances_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT fk_attendances_site FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT fk_attendances_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;
