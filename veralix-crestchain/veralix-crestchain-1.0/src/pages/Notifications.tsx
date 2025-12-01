import { AppLayout } from "@/components/layout/AppLayout";
import { NotificationCenter } from "@/components/NotificationCenter";

const Notifications = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
          <p className="text-muted-foreground">
            Revisa todas tus notificaciones y mantente al día con tu actividad
          </p>
        </div>

        <NotificationCenter />
      </div>
    </AppLayout>
  );
};

export default Notifications;
