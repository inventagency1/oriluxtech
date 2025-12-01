import { ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavGroupProps {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsed?: boolean;
}

export const NavGroup = ({ label, children, defaultOpen = true, collapsed }: NavGroupProps) => {
  if (collapsed) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <Collapsible defaultOpen={defaultOpen} className="space-y-1">
      <CollapsibleTrigger className="nav-group-header flex items-center justify-between w-full group hover:text-veralix-gold transition-colors">
        <span>{label}</span>
        <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
