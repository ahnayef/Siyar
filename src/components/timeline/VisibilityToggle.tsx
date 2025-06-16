
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateTimelineVisibilityAction } from '@/actions/timelineActions';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { logAnalyticsEvent } from '@/lib/analytics';

interface VisibilityToggleProps {
  timelineId: string;
  initialIsPublic: boolean;
  className?: string;
  iconOnly?: boolean;
}

export default function VisibilityToggle({ timelineId, initialIsPublic, className, iconOnly = false }: VisibilityToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to change timeline visibility.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const newVisibilityState = !isPublic;
    try {
      await updateTimelineVisibilityAction(user.uid, timelineId, newVisibilityState);
      setIsPublic(newVisibilityState);
      toast({
        title: "Visibility Updated",
        description: `Timeline is now ${newVisibilityState ? 'public' : 'private'}.`,
      });
      logAnalyticsEvent('toggle_timeline_visibility', { 
        timeline_id: timelineId, 
        user_id: user.uid,
        new_visibility: newVisibilityState ? 'public' : 'private' 
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Visibility",
        description: error.message || "Could not update timeline visibility.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
        onClick={handleToggle} 
        disabled={isLoading || !user} 
        variant="outline" 
        size={iconOnly ? "icon" : undefined}
        className={cn("neo-button-outline", className)}
        title={isPublic ? 'Make timeline private' : 'Make timeline public'}
    >
      {isLoading ? (
        <Loader2 className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", !iconOnly && "mr-1 sm:mr-1.5", "animate-spin")} />
      ) : isPublic ? (
        <Unlock className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", !iconOnly && "mr-1 sm:mr-1.5", "text-primary")} />
      ) : (
        <Lock className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", !iconOnly && "mr-1 sm:mr-1.5", "text-muted-foreground")} />
      )}
      {!iconOnly && <span className="inline">{isPublic ? 'Public' : 'Private'}</span>}
    </Button>
  );
}
