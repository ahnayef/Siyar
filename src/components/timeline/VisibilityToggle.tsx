
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
}

export default function VisibilityToggle({ timelineId, initialIsPublic, className }: VisibilityToggleProps) {
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
        className={cn("neo-button-outline px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm h-8 sm:h-auto", className)}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-1.5" />
      ) : isPublic ? (
        <Unlock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-primary" />
      ) : (
        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-muted-foreground" />
      )}
      <span className="hidden sm:inline">{isPublic ? 'Public' : 'Private'}</span>
      <span className="sm:hidden">{isPublic ? 'Pub' : 'Priv'}</span>
    </Button>
  );
}
