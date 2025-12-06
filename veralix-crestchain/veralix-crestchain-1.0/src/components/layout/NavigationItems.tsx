import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: string;
  description?: string;
  badge?: string | number;
  highlight?: boolean;
  shortcut?: string;
  external?: boolean;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
  roles?: string[];
}

import { 
  Home,
  ShoppingBag,
  Gem,
  FileText,
  User,
  Settings,
  Shield,
  Plus,
  Search,
  BarChart3,
  Award,
  CreditCard,
  Bell,
  HelpCircle,
  Mail,
  DollarSign,
  LayoutDashboard,
  Users,
  Coins
} from "lucide-react";

export const getNavigationItems = (role: string | null, isAdmin: boolean, isJoyero: boolean, isCliente: boolean): NavigationGroup[] => {
  const groups: NavigationGroup[] = [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
        { title: "Verificar", url: "/verify", icon: Shield },
        { title: "Precios", url: "/pricing", icon: DollarSign },
        { title: "Ayuda", url: "/help", icon: HelpCircle },
      ]
    }
  ];

  // Add role-specific navigation
  if (isAdmin) {
    groups.push({
      label: "Administración",
      items: [
        { title: "Usuarios", url: "/admin/users", icon: Users, permission: "manage_users" },
        { title: "Todos los Certificados", url: "/admin/all-certificates", icon: Shield, permission: "manage_system" },
        { title: "Configuración", url: "/admin/settings", icon: Settings, permission: "manage_system" },
        { title: "Paquetes", url: "/admin/certificate-bundles", icon: CreditCard },
        { title: "Auditoría", url: "/auditoria", icon: FileText, permission: "view_audit_logs" },
        { title: "Email Testing", url: "/email-testing", icon: Mail },
      ],
      roles: ['admin']
    });
  }

  if (isJoyero || isAdmin) {
    groups.push({
      label: "Joyero",
      items: [
        { 
          title: "Nueva Joya", 
          url: "/nueva-joya", 
          icon: Plus, 
          permission: "create_jewelry",
          description: "Crear certificado para nueva pieza",
          highlight: true,
          badge: "Destacado"
        },
        { 
          title: "Mis Certificados", 
          url: "/certificados", 
          icon: FileText, 
          permission: "view_certificates",
          description: "Ver todos tus certificados"
        },
        { 
          title: "Mis Paquetes", 
          url: "/certificate-bundles/manage", 
          icon: CreditCard, 
          permission: "view_certificates",
          description: "Gestionar paquetes de certificados"
        },
        { 
          title: "Gestión Certificados", 
          url: "/gestion-certificados", 
          icon: Shield, 
          permission: "batch_certificates",
          description: "Gestión masiva de certificados"
        },
        { 
          title: "Crear Listado", 
          url: "/crear-listado", 
          icon: ShoppingBag, 
          permission: "create_listing",
          description: "Publicar joya en marketplace"
        },
        { 
          title: "Mi Marketplace", 
          url: "/mi-marketplace", 
          icon: Gem, 
          permission: "manage_listings",
          description: "Gestionar tus listados"
        },
        { 
          title: "Analytics", 
          url: "/analytics", 
          icon: BarChart3, 
          permission: "view_analytics",
          description: "Estadísticas de ventas"
        },
        // TEMPORAL: Ocultar hasta que esté funcional
        // { 
        //   title: "Airdrops", 
        //   url: "/airdrop", 
        //   icon: Coins, 
        //   permission: "create_airdrops",
        //   description: "Gestionar distribución de tokens"
        // },
      ],
      roles: ['joyero', 'admin']
    });
  }

  if (isCliente || isAdmin) {
    groups.push({
      label: "Cliente",
      items: [
        { title: "Mis Certificados", url: "/certificados", icon: Award },
        { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
        { title: "Mis Compras", url: "/mi-marketplace", icon: ShoppingBag },
      ],
      roles: ['cliente', 'admin']
    });
  }

  // Add common user section
  if (role) {
    groups.push({
      label: "Cuenta",
      items: [
        { title: "Perfil", url: "/perfil", icon: User },
        { title: "Notificaciones", url: "/notifications", icon: Bell },
        { title: "Configuración", url: "/settings", icon: Settings },
      ]
    });
  }

  return groups;
};

// Quick actions for header
export const getQuickActions = (role: string | null, isAdmin: boolean, isJoyero: boolean, isCliente: boolean): NavigationItem[] => {
  const actions: NavigationItem[] = [
    { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  ];

  if (isJoyero || isAdmin) {
    actions.push(
      { title: "Certificados", url: "/certificados", icon: FileText },
      { title: "Nueva Joya", url: "/nueva-joya", icon: Plus }
    );
  }

  if (isCliente || isAdmin) {
    actions.push(
      { title: "Mis Compras", url: "/mi-marketplace", icon: ShoppingBag }
    );
  }

  if (isAdmin) {
    actions.push(
      { title: "Auditoría", url: "/auditoria", icon: Shield }
    );
  }

  return actions;
};

// Get primary CTA based on role
export const getPrimaryCTA = (role: string | null, isAdmin: boolean, isJoyero: boolean, isCliente: boolean): NavigationItem | null => {
  if (isJoyero || isAdmin) {
    return { 
      title: "Nueva Joya", 
      url: "/nueva-joya", 
      icon: Plus,
      highlight: true,
      description: "Crear nuevo certificado NFT"
    };
  }
  
  if (isCliente) {
    return { 
      title: "Explorar Marketplace", 
      url: "/marketplace", 
      icon: ShoppingBag,
      description: "Descubre joyas certificadas"
    };
  }
  
  return null;
};
