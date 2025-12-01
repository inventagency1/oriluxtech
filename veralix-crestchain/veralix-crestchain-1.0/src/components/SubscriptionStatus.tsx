/**
 * @deprecated Este componente está deprecado y será eliminado en v2.0
 * Usar en su lugar: CertificateBalanceStatus
 * 
 * Este componente ahora simplemente renderiza CertificateBalanceStatus.
 * Se mantiene solo para compatibilidad con código legacy.
 */
import { CertificateBalanceStatus } from "@/components/CertificateBalanceStatus";

export function SubscriptionStatus() {
  console.warn('SubscriptionStatus is deprecated. Use CertificateBalanceStatus instead.');
  return <CertificateBalanceStatus />;
}
