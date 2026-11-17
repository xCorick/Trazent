import { AimOutlined, GlobalOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, InputNumber, Modal, Slider } from 'antd';
import { useEffect, useState } from 'react';
import { GeofencePreview } from '@/molecules';
import type { SaveSiteRequest, Site } from '@/types';
import { mapUrl } from '@/utils/geo';

interface SiteFormModalProps {
  open: boolean;
  site?: Site | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: SaveSiteRequest) => Promise<boolean>;
}

const DEFAULT_SITE: SaveSiteRequest = { name: '', latitude: 29.0729, longitude: -110.9559, radiusMeters: 100 };

/** Alta y edición de sitios de trabajo con su geocerca (solo administrador). */
export function SiteFormModal({ open, site, loading, onCancel, onSubmit }: SiteFormModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<SaveSiteRequest>();
  const [locating, setLocating] = useState(false);
  const radius = Form.useWatch('radiusMeters', form) ?? DEFAULT_SITE.radiusMeters;
  const latitude = Form.useWatch('latitude', form);
  const longitude = Form.useWatch('longitude', form);
  const isEdit = Boolean(site);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(
      site
        ? {
            name: site.name,
            address: site.address,
            latitude: site.latitude,
            longitude: site.longitude,
            radiusMeters: site.radiusMeters,
          }
        : DEFAULT_SITE,
    );
  }, [open, site, form]);

  const useCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      message.error('Este navegador no permite obtener la ubicación.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        form.setFieldsValue({
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
        });
        setLocating(false);
      },
      () => {
        message.warning('No se pudo obtener la ubicación. Escribe las coordenadas a mano.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const handleFinish = async (values: SaveSiteRequest) => {
    const saved = await onSubmit(values);
    if (saved) form.resetFields();
  };

  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar sitio' : 'Nuevo sitio de trabajo'}
      okText={isEdit ? 'Guardar cambios' : 'Crear sitio'}
      cancelText="Cancelar"
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={loading}
      forceRender
      width={640}
    >
      <Form<SaveSiteRequest> form={form} layout="vertical" requiredMark="optional" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Nombre del sitio"
          rules={[
            { required: true, message: 'Escribe el nombre del sitio.' },
            { max: 150, message: 'Máximo 150 caracteres.' },
          ]}
        >
          <Input placeholder="Ej. Obra Centro" />
        </Form.Item>
        <Form.Item name="address" label="Dirección">
          <Input placeholder="Opcional, solo informativa" maxLength={255} />
        </Form.Item>

        <div className="tz-geofence-editor">
          <div className="tz-geofence-editor__fields">
            <div className="tz-form-row">
              <Form.Item name="latitude" label="Latitud" rules={[{ required: true, message: 'Requerida.' }]}>
                <InputNumber min={-90} max={90} step={0.0001} precision={6} className="tz-full" />
              </Form.Item>
              <Form.Item name="longitude" label="Longitud" rules={[{ required: true, message: 'Requerida.' }]}>
                <InputNumber min={-180} max={180} step={0.0001} precision={6} className="tz-full" />
              </Form.Item>
            </div>
            <div className="tz-geofence-editor__buttons">
              <Button icon={<AimOutlined />} onClick={useCurrentLocation} loading={locating}>
                Usar mi ubicación
              </Button>
              <Button
                icon={<GlobalOutlined />}
                href={hasCoordinates ? mapUrl({ latitude, longitude }) : undefined}
                target="_blank"
                rel="noreferrer"
                disabled={!hasCoordinates}
              >
                Ver en mapa
              </Button>
            </div>
            <Form.Item
              name="radiusMeters"
              label={`Radio de la geocerca: ${radius} m`}
              extra="Una asistencia registrada más lejos del centro se marca como fuera de geocerca."
              rules={[{ required: true, message: 'Requerido.' }]}
            >
              <Slider min={20} max={1000} step={10} marks={{ 20: '20 m', 500: '500 m', 1000: '1 km' }} />
            </Form.Item>
          </div>
          <GeofencePreview radiusMeters={radius} size={150} />
        </div>
      </Form>
    </Modal>
  );
}
