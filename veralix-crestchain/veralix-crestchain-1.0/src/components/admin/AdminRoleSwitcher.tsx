import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Gem, 
  User, 
  Eye, 
  EyeOff,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

const roleConfig: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  admin: {
    label: 'Administrador',
    icon: <Shield className="h-4 w-4" />,
    color: 'bg-purple-500',
    description: 'Acceso total al sistema'
  },
  joyero: {
    label: 'Joyero',
    icon: <Gem className="h-4 w-4" />,
    color: 'bg-amber-500',
    description: 'Crear y gestionar joyas'
  },
  cliente: {
    label: 'Cliente',
    icon: <User className="h-4 w-4" />,
    color: 'bg-blue-500',
    description: 'Ver certificados propios'
  }
};

export function AdminRoleSwitcher() {
  const { 
    role, 
    effectiveRole, 
    isRealAdmin, 
    isSimulating, 
    simulateRole, 
    clearSimulatedRole 
  } = useUserRole();

  // Solo mostrar si el usuario es realmente admin
  if (!isRealAdmin) {
    return null;
  }

  const currentConfig = roleConfig[effectiveRole || 'admin'];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`
              flex items-center gap-2 px-4 py-2 
              bg-black/90 border-white/20 text-white
              hover:bg-white/10 hover:border-white/40
              shadow-lg backdrop-blur-sm
              ${isSimulating ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-black' : ''}
            `}
          >
            {isSimulating ? (
              <Eye className="h-4 w-4 text-amber-400" />
            ) : (
              <Shield className="h-4 w-4 text-purple-400" />
            )}
            <span className="font-medium">
              {isSimulating ? 'Simulando: ' : ''}
              {currentConfig.label}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-black/95 border-white/20 text-white backdrop-blur-md"
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-white/70">
            <Eye className="h-4 w-4" />
            Modo de Vista (Testing)
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-white/10" />
          
          {/* Opción: Ver como Admin (rol real) */}
          <DropdownMenuItem 
            onClick={clearSimulatedRole}
            className="flex items-center gap-3 cursor-pointer hover:bg-white/10 focus:bg-white/10"
          >
            <div className={`p-1.5 rounded ${roleConfig.admin.color}`}>
              {roleConfig.admin.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{roleConfig.admin.label}</span>
                {!isSimulating && (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                )}
              </div>
              <span className="text-xs text-white/50">{roleConfig.admin.description}</span>
            </div>
            <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
              Real
            </Badge>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-white/10" />
          
          <DropdownMenuLabel className="text-xs text-white/50 font-normal">
            Simular experiencia de:
          </DropdownMenuLabel>
          
          {/* Opción: Simular Joyero */}
          <DropdownMenuItem 
            onClick={() => simulateRole('joyero')}
            className="flex items-center gap-3 cursor-pointer hover:bg-white/10 focus:bg-white/10"
          >
            <div className={`p-1.5 rounded ${roleConfig.joyero.color}`}>
              {roleConfig.joyero.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{roleConfig.joyero.label}</span>
                {isSimulating && effectiveRole === 'joyero' && (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                )}
              </div>
              <span className="text-xs text-white/50">{roleConfig.joyero.description}</span>
            </div>
          </DropdownMenuItem>
          
          {/* Opción: Simular Cliente */}
          <DropdownMenuItem 
            onClick={() => simulateRole('cliente')}
            className="flex items-center gap-3 cursor-pointer hover:bg-white/10 focus:bg-white/10"
          >
            <div className={`p-1.5 rounded ${roleConfig.cliente.color}`}>
              {roleConfig.cliente.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{roleConfig.cliente.label}</span>
                {isSimulating && effectiveRole === 'cliente' && (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                )}
              </div>
              <span className="text-xs text-white/50">{roleConfig.cliente.description}</span>
            </div>
          </DropdownMenuItem>
          
          {isSimulating && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={clearSimulatedRole}
                className="flex items-center gap-2 cursor-pointer text-amber-400 hover:bg-amber-500/10 focus:bg-amber-500/10"
              >
                <EyeOff className="h-4 w-4" />
                <span>Salir del modo simulación</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Indicador visual cuando está simulando */}
      {isSimulating && (
        <div className="absolute -top-8 right-0 bg-amber-500/90 text-black text-xs px-2 py-1 rounded-t font-medium flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Modo Testing
        </div>
      )}
    </div>
  );
}
