import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Segmented, Skeleton } from 'antd';
import { useMemo, useState } from 'react';
import { SiteFormModal } from '@/components';
import { useAllSites, useCreateSite, useUpdateSite } from '@/hooks/useAdmin';
import { EmptyState, PageHeader, SiteCard } from '@/molecules';
import { errorMessage } from '@/services/apiError';
import type { SaveSiteRequest, Site } from '@/types';

type Filter = 'active' | 'inactive' | 'all';

const filterOptions: { label: string; value: Filter }[] = [
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
  { label: 'Todos', value: 'all' },
];

/** Sitios de trabajo y sus geocercas (solo administrador). */
export function SitesView() {
  const { message } = App.useApp();
  const sites = useAllSites();
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  const [filter, setFilter] = useState<Filter>('active');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const visibleSites = useMemo(() => {
    const all = sites.data ?? [];
    if (filter === 'all') return all;
    return all.filter((site) => site.isActive === (filter === 'active'));
  }, [sites.data, filter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (site: Site) => {
    setEditing(site);
    setModalOpen(true);
  };

  const handleSubmit = async (values: SaveSiteRequest) => {
    try {
      if (editing) {
        await updateSite.mutateAsync({ id: editing.id, ...values });
        message.success('Sitio actualizado.');
      } else {
        const site = await createSite.mutateAsync(values);
        message.success(`Sitio "${site.name}" creado.`);
      }
      setModalOpen(false);
      return true;
    } catch (err) {
      message.error(errorMessage(err));
      return false;
    }
  };

  const handleToggle = async (site: Site, active: boolean) => {
    setTogglingId(site.id);
    try {
      await updateSite.mutateAsync({ id: site.id, isActive: active });
      message.success(active ? `${site.name} está activo.` : `${site.name} fue desactivado.`);
    } catch (err) {
      message.error(errorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="tz-page">
      <PageHeader
        title="Sitios y geocercas"
        subtitle="Define dónde trabajan los contratistas y qué tan lejos pueden registrar asistencia."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo sitio
          </Button>
        }
      />

      <Card className="tz-card">
        <div className="tz-toolbar">
          <Segmented options={filterOptions} value={filter} onChange={(value) => setFilter(value as Filter)} />
          <span className="tz-muted">{visibleSites.length} sitios</span>
        </div>

        {sites.isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : visibleSites.length === 0 ? (
          <EmptyState title="Sin sitios" description="Crea un sitio para empezar a registrar asistencias." />
        ) : (
          <div className="tz-site-grid">
            {visibleSites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onEdit={() => openEdit(site)}
                onToggleActive={(active) => void handleToggle(site, active)}
                toggling={togglingId === site.id}
              />
            ))}
          </div>
        )}
      </Card>

      <SiteFormModal
        open={modalOpen}
        site={editing}
        loading={createSite.isPending || (updateSite.isPending && !togglingId)}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
