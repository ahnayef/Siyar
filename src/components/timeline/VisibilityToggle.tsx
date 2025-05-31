
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateTimelineVisibilityAction } from '@/actions/timelineActions';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

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
    try {
      await updateTimelineVisibilityAction(user.uid, timelineId, !isPublic);
      setIsPublic(!isPublic);
      toast({
        title: "Visibility Updated",
        description: `Timeline is now ${!isPublic ? 'public' : 'private'}.`,
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
        className={cn("neo-button-outline px-3 py-1.5 text-sm", className)}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1 sm:mr-2" />
      ) : isPublic ? (
        <Unlock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-primary" />
      ) : (
        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-muted-foreground" />
      )}
      {isPublic ? 'Public' : 'Private'}
    </Button>
  );
}
