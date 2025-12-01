import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavigationItem } from "@/components/layout/NavigationItems";

interface NavItemProps {
  item: NavigationItem;
  isActive: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export const NavItem = ({ item, isActive, collapsed, onClick }: NavItemProps) => {
  const content = (
    <NavLink
      to={item.url}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md group",
        "transition-all duration-200",
        isActive
          ? "nav-item-active"
          : "nav-item-hover",
        item.highlight && "ring-2 ring-veralix-gold/30 bg-veralix-gold/5"
      )}
      onClick={onClick}
    >
      <item.icon className={cn(
        "w-5 h-5 flex-shrink-0 transition-colors",
        isActive ? "text-veralix-gold" : "text-veralix-gold/70 group-hover:text-veralix-gold"
      )} />
      {!collapsed && (
        <>
          <span className={cn(
            "flex-1 text-sm font-medium transition-colors",
            isActive ? "text-veralix-gold" : "text-foreground group-hover:text-veralix-gold"
          )}>
            {item.title}
          </span>
          {item.badge && (
            <Badge 
              variant="secondary" 
              className="ml-auto text-xs bg-veralix-gold/10 text-veralix-gold border-veralix-gold/20"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-background border-veralix-gold/20">
            <p className="font-medium text-foreground">{item.title}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
