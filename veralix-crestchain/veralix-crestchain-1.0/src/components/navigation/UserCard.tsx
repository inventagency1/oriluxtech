import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserCardProps {
  email?: string;
  roleLabel?: string;
  variant?: "sidebar" | "dropdown" | "mobile";
  collapsed?: boolean;
}

export const UserCard = ({ email, roleLabel, variant = "sidebar", collapsed }: UserCardProps) => {
  const displayName = email?.split('@')[0] || 'Usuario';

  if (collapsed && variant === "sidebar") {
    return (
      <div className="flex items-center justify-center">
        <Avatar className="w-8 h-8 border-2 border-veralix-gold">
          <AvatarFallback className="bg-veralix-gold/10 text-veralix-gold text-xs font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className="p-4 border-b border-border bg-gradient-to-br from-veralix-gold/5 to-transparent">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-veralix-gold">
            <AvatarFallback className="bg-veralix-gold/10 text-veralix-gold font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            {roleLabel && (
              <Badge variant="outline" className="mt-1 border-veralix-gold/20 text-veralix-gold text-xs">
                {roleLabel}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="p-4 rounded-lg bg-gradient-to-r from-veralix-gold/10 to-transparent border border-veralix-gold/20">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-veralix-gold">
            <AvatarFallback className="bg-veralix-gold/10 text-veralix-gold font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{displayName}</p>
            {roleLabel && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {roleLabel}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <div className="flex items-center gap-2 mb-3">
      <UserIcon className="w-4 h-4 text-veralix-gold" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-foreground font-medium truncate block">
          {displayName}
        </span>
        {roleLabel && (
          <span className="text-xs text-muted-foreground">{roleLabel}</span>
        )}
      </div>
    </div>
  );
};
