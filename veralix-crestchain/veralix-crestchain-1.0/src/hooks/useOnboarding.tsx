import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

const ONBOARDING_KEY = 'veralix_onboarding_completed';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  skipped: boolean;
  action: string;
  priority: 'high' | 'medium' | 'low';
  role: 'joyero' | 'cliente' | 'both';
}

const joyeroTasks: OnboardingTask[] = [
  {
    id: 'profile',
    title: 'Completa tu perfil',
    description: 'Añade información de tu negocio y contacto',
    completed: false,
    skipped: false,
    action: '/profile',
    priority: 'high',
    role: 'joyero',
  },
  {
    id: 'first-jewelry',
    title: 'Registra tu primera joya',
    description: 'Crea tu primer item de joyería en el sistema',
    completed: false,
    skipped: false,
    action: '/new-jewelry',
    priority: 'high',
    role: 'joyero',
  },
  {
    id: 'first-certificate',
    title: 'Genera tu primer certificado',
    description: 'Crea un certificado NFT para una joya',
    completed: false,
    skipped: false,
    action: '/certificates',
    priority: 'high',
    role: 'joyero',
  },
  {
    id: 'marketplace-listing',
    title: 'Crea tu primer listing',
    description: 'Publica una joya en el marketplace',
    completed: false,
    skipped: false,
    action: '/crear-listado',
    priority: 'medium',
    role: 'joyero',
  },
  {
    id: 'explore-analytics',
    title: 'Revisa tus analytics',
    description: 'Ve tus métricas y estadísticas',
    completed: false,
    skipped: false,
    action: '/analytics',
    priority: 'low',
    role: 'joyero',
  },
];

const clienteTasks: OnboardingTask[] = [
  {
    id: 'profile',
    title: 'Completa tu perfil',
    description: 'Añade tu información personal',
    completed: false,
    skipped: false,
    action: '/profile',
    priority: 'high',
    role: 'cliente',
  },
  {
    id: 'explore',
    title: 'Explora el marketplace',
    description: 'Descubre joyas certificadas disponibles',
    completed: false,
    skipped: false,
    action: '/marketplace',
    priority: 'high',
    role: 'cliente',
  },
  {
    id: 'scan-qr',
    title: 'Escanea un certificado',
    description: 'Verifica la autenticidad de una joya',
    completed: false,
    skipped: false,
    action: '/verify',
    priority: 'medium',
    role: 'cliente',
  },
];

export const useOnboarding = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [progress, setProgress] = useState<OnboardingTask[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get tasks based on role
  const roleTasks = useMemo(() => {
    if (role === 'joyero') return joyeroTasks;
    if (role === 'cliente') return clienteTasks;
    return [];
  }, [role]);

  // Fetch progress from Supabase
  const fetchProgress = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Merge with default tasks
      const updatedTasks = roleTasks.map(task => {
        const savedProgress = data?.find(p => p.task_id === task.id);
        if (savedProgress) {
          return {
            ...task,
            completed: savedProgress.completed,
            skipped: savedProgress.skipped,
          };
        }
        return task;
      });

      setProgress(updatedTasks);

      // Check if onboarding modal should show
      const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
      setShowOnboarding(!hasCompletedOnboarding);
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      setProgress(roleTasks);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user, role]);

  const completeTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          task_id: taskId,
          completed: true,
          completed_at: new Date().toISOString(),
          skipped: false,
        });

      if (error) throw error;

      // Update local state
      setProgress(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, completed: true, skipped: false } : task
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const skipTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          task_id: taskId,
          skipped: true,
          completed: false,
        });

      if (error) throw error;

      // Update local state
      setProgress(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, skipped: true, completed: false } : task
        )
      );
    } catch (error) {
      console.error('Error skipping task:', error);
    }
  };

  // Auto-complete task silently (used by app actions)
  const autoCompleteTask = async (taskId: string) => {
    if (!user) return;

    const task = progress.find(t => t.id === taskId);
    if (!task || task.completed) return;

    try {
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          task_id: taskId,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      setProgress(prev =>
        prev.map(t => t.id === taskId ? { ...t, completed: true, skipped: false } : t)
      );
    } catch (error) {
      console.error('Error auto-completing task:', error);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  const completionPercentage = useMemo(() => {
    if (progress.length === 0) return 0;
    const completed = progress.filter(t => t.completed).length;
    return Math.round((completed / progress.length) * 100);
  }, [progress]);

  const nextTask = useMemo(() => {
    return progress.find(t => !t.completed && !t.skipped);
  }, [progress]);

  const isComplete = useMemo(() => {
    return progress.length > 0 && progress.every(t => t.completed || t.skipped);
  }, [progress]);

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    progress,
    completeTask,
    autoCompleteTask,
    skipTask,
    completionPercentage,
    nextTask,
    isComplete,
  };
};
