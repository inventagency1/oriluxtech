/**
 * @deprecated Esta página está deprecada y será eliminada en v2.0
 * Redirige automáticamente a la nueva página de gestión de paquetes de certificados
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/certificate-bundles/manage', { replace: true });
  }, [navigate]);

  return null;
}
