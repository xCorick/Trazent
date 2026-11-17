import { CameraOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { compressImage } from '@/utils/image';
import { photoPlaceholder } from '@/utils/placeholder';

interface PhotoPickerProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  /** Texto de la foto simulada para presentar el prototipo desde una computadora. */
  sampleLabel?: string;
}

/**
 * Captura una foto con la cámara del teléfono (input con capture) y la comprime.
 * En la app nativa se reemplaza por expo-camera.
 */
export function PhotoPicker({ value, onChange, label = 'Tomar foto', sampleLabel }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCamera = () => inputRef.current?.click();

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      onChange(await compressImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo leer la imagen.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="tz-photo-picker">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
      {value ? (
        <div className="tz-photo-picker__preview">
          <img src={value} alt="Fotografía capturada" />
          <Button icon={<ReloadOutlined />} onClick={openCamera} className="tz-photo-picker__retake">
            Repetir
          </Button>
        </div>
      ) : (
        <button type="button" className="tz-photo-picker__empty" onClick={openCamera} disabled={processing}>
          {processing ? <Spin /> : <CameraOutlined className="tz-photo-picker__icon" />}
          <span className="tz-photo-picker__label">{processing ? 'Procesando foto…' : label}</span>
          <span className="tz-photo-picker__hint">Se abrirá la cámara del teléfono</span>
        </button>
      )}
      {error && <div className="tz-photo-picker__error">{error}</div>}
      {!value && sampleLabel && (
        <Button type="link" size="small" onClick={() => onChange(photoPlaceholder(sampleLabel))}>
          Usar foto de ejemplo
        </Button>
      )}
    </div>
  );
}
