import { AdminCertificateAssignment } from '@/components/admin/AdminCertificateAssignment';
import { AppLayout } from '@/components/layout/AppLayout';

export default function AssignPackages() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <AdminCertificateAssignment />
      </div>
    </AppLayout>
  );
}
