import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GlobalAIChatButtonProps {
  onClick: () => void;
  hasUnreadMessages?: boolean;
}

export function GlobalAIChatButton({ 
  onClick, 
  hasUnreadMessages = false 
}: GlobalAIChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform bg-primary hover:bg-primary/90"
      size="icon"
    >
      <div className="relative">
        <MessageCircle className="h-6 w-6" />
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse" />
        {hasUnreadMessages && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-destructive border-2 border-background" />
        )}
      </div>
    </Button>
  );
}
