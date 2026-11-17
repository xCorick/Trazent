import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { CreateTaskRequest, Site, User } from '@/types';

interface TaskFormValues {
  title: string;
  description?: string;
  siteId: string;
  assignedToId: string;
  dueAt?: Dayjs;
}

interface TaskFormModalProps {
  open: boolean;
  sites: Site[];
  contractors: User[];
  loading: boolean;
  onCancel: () => void;
  /** Devuelve true si la tarea se creó, para limpiar el formulario. */
  onSubmit: (request: CreateTaskRequest) => Promise<boolean>;
}

/** Formulario para asignar una tarea a un contratista. */
export function TaskFormModal({ open, sites, contractors, loading, onCancel, onSubmit }: TaskFormModalProps) {
  const [form] = Form.useForm<TaskFormValues>();

  const handleFinish = async (values: TaskFormValues) => {
    const created = await onSubmit({
      title: values.title,
      description: values.description,
      siteId: values.siteId,
      assignedToId: values.assignedToId,
      dueAt: values.dueAt?.toISOString(),
    });
    if (created) form.resetFields();
  };

  return (
    <Modal
      open={open}
      title="Asignar tarea"
      okText="Asignar tarea"
      cancelText="Cancelar"
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
      width={560}
    >
      <Form<TaskFormValues>
        form={form}
        layout="vertical"
        requiredMark="optional"
        onFinish={handleFinish}
        preserve={false}
      >
        <Form.Item
          name="title"
          label="Título"
          rules={[
            { required: true, message: 'Escribe el título de la tarea.' },
            { max: 150, message: 'Máximo 150 caracteres.' },
          ]}
        >
          <Input placeholder="Ej. Limpieza del área B" />
        </Form.Item>
        <Form.Item name="description" label="Instrucciones">
          <Input.TextArea
            rows={3}
            placeholder="Qué debe hacer y qué debe mostrar la foto de evidencia"
            maxLength={500}
            showCount
          />
        </Form.Item>
        <div className="tz-form-row">
          <Form.Item
            name="assignedToId"
            label="Contratista"
            rules={[{ required: true, message: 'Elige un contratista.' }]}
          >
            <Select
              placeholder="Selecciona"
              showSearch
              optionFilterProp="label"
              options={contractors.map((c) => ({
                value: c.id,
                label: c.specialty ? `${c.fullName} · ${c.specialty}` : c.fullName,
              }))}
            />
          </Form.Item>
          <Form.Item name="siteId" label="Sitio" rules={[{ required: true, message: 'Elige el sitio.' }]}>
            <Select placeholder="Selecciona" options={sites.map((s) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
        </div>
        <Form.Item name="dueAt" label="Fecha límite">
          <DatePicker
            showTime={{ format: 'HH:mm', minuteStep: 15 }}
            format="DD/MM/YYYY HH:mm"
            style={{ width: '100%' }}
            disabledDate={(date) => date.isBefore(dayjs(), 'day')}
            placeholder="Opcional"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
