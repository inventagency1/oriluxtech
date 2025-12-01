import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Check, 
  X,
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnboarding, OnboardingTask } from '@/hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';

interface TaskItemProps {
  task: OnboardingTask;
  onComplete: () => void;
  onSkip: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onSkip }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate(task.action);
  };

  if (task.completed) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground line-through">
            {task.title}
          </p>
        </div>
      </div>
    );
  }

  if (task.skipped) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <X className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground line-through">
            {task.title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0 mt-0.5">
        <div className="w-2 h-2 rounded-full bg-primary/50" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-1">
              {task.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {task.description}
            </p>
          </div>
          {task.priority === 'high' && (
            <Badge variant="destructive" className="text-xs">
              Alta
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="sm"
            variant="default"
            onClick={handleAction}
            className="h-7 text-xs"
          >
            Ir
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onSkip}
            className="h-7 text-xs"
          >
            Omitir
          </Button>
        </div>
      </div>
    </div>
  );
};

export const OnboardingChecklist: React.FC = () => {
  const { 
    progress, 
    completeTask, 
    skipTask, 
    completionPercentage,
    isComplete,
  } = useOnboarding();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Don't show if complete
  if (isComplete) {
    return null;
  }

  // Don't show if no tasks
  if (progress.length === 0) {
    return null;
  }

  return (
    <Card 
      className={cn(
        "fixed bottom-6 right-6 shadow-xl border-border/50 transition-all duration-300 z-50",
        isCollapsed ? "w-14 h-14" : "w-80 max-h-[600px] overflow-hidden"
      )}
    >
      {!isCollapsed ? (
        <>
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Comenzando
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4 overflow-y-auto max-h-[500px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-semibold text-foreground">
                  {completionPercentage}%
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress.filter(t => t.completed).length} de {progress.length} tareas completadas
              </p>
            </div>

            <div className="space-y-2">
              {progress.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={() => completeTask(task.id)}
                  onSkip={() => skipTask(task.id)}
                />
              ))}
            </div>
          </CardContent>
        </>
      ) : (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full h-full flex items-center justify-center hover:bg-accent/50 rounded-lg transition-colors relative"
        >
          <Sparkles className="w-6 h-6 text-primary" />
          {completionPercentage > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </button>
      )}
    </Card>
  );
};