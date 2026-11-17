import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export function NotFoundView() {
  const navigate = useNavigate();
  return (
    <div className="tz-center-screen">
      <Result
        status="404"
        title="Página no encontrada"
        subTitle="La dirección no existe o ya no está disponible."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Ir al inicio
          </Button>
        }
      />
    </div>
  );
}
