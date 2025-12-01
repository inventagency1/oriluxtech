import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Crown, UserCheck, Users } from "lucide-react";

interface User {
  role?: string | null;
  created_at: string;
}

interface UserStatsCardsProps {
  users: User[];
}

export const UserStatsCards = ({ users }: UserStatsCardsProps) => {
  const adminCount = users.filter(u => u.role === 'admin').length;
  const joyeroCount = users.filter(u => u.role === 'joyero').length;
  const clienteCount = users.filter(u => u.role === 'cliente').length;
  const totalCount = users.length;

  // Usuarios registrados este mes
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newUsersThisMonth = users.filter(u => {
    const createdDate = new Date(u.created_at);
    return createdDate >= firstDayOfMonth;
  }).length;

  const stats = [
    {
      title: "Total Usuarios",
      value: totalCount,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Administradores",
      value: adminCount,
      icon: Shield,
      color: "text-destructive",
    },
    {
      title: "Joyerías",
      value: joyeroCount,
      icon: Crown,
      color: "text-primary",
    },
    {
      title: "Clientes",
      value: clienteCount,
      icon: UserCheck,
      color: "text-secondary-foreground",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === "Total Usuarios" && (
                <p className="text-xs text-muted-foreground">
                  +{newUsersThisMonth} este mes
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
