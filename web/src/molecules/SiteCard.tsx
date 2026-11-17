import { EditOutlined, EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';
import { Button, Switch, Tooltip } from 'antd';
import { StatusTag } from '@/atoms';
import type { Site } from '@/types';
import { mapUrl } from '@/utils/geo';
import { GeofencePreview } from './GeofencePreview';

interface SiteCardProps {
  site: Site;
  onEdit: () => void;
  onToggleActive: (active: boolean) => void;
  toggling?: boolean;
}

/** Tarjeta de un sitio de trabajo con su geocerca. */
export function SiteCard({ site, onEdit, onToggleActive, toggling }: SiteCardProps) {
  return (
    <div className={`tz-site-card${site.isActive ? '' : ' is-inactive'}`}>
      <GeofencePreview radiusMeters={site.radiusMeters} size={112} muted={!site.isActive} />
      <div className="tz-site-card__body">
        <div className="tz-site-card__head">
          <h3>{site.name}</h3>
          {site.isActive ? <StatusTag tone="green">Activo</StatusTag> : <StatusTag tone="gray">Inactivo</StatusTag>}
        </div>
        {site.address && (
          <div className="tz-site-card__meta">
            <EnvironmentOutlined /> {site.address}
          </div>
        )}
        <div className="tz-site-card__coords">
          {site.latitude.toFixed(5)}, {site.longitude.toFixed(5)} · radio {site.radiusMeters} m
        </div>
        <div className="tz-site-card__actions">
          <Button size="small" icon={<EditOutlined />} onClick={onEdit}>
            Editar
          </Button>
          <Button size="small" icon={<GlobalOutlined />} href={mapUrl(site)} target="_blank" rel="noreferrer">
            Ver en mapa
          </Button>
          <Tooltip title={site.isActive ? 'Desactivar: deja de aparecer al registrar asistencia' : 'Activar'}>
            <Switch
              size="small"
              checked={site.isActive}
              loading={toggling}
              onChange={onToggleActive}
              aria-label={site.isActive ? 'Desactivar sitio' : 'Activar sitio'}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
