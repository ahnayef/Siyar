"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateTimelineVisibilityAction } from '@/actions/timelineActions';

interface VisibilityToggleProps {
  timelineId: string;
  initialIsPublic: boolean;
}

export default function VisibilityToggle({ timelineId, initialIsPublic }: VisibilityToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await updateTimelineVisibilityAction(timelineId, !isPublic);
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
    <Button onClick={handleToggle} disabled={isLoading} variant="outline" size="sm" className="neo-button bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isPublic ? (
        <Unlock className="h-4 w-4 mr-2" />
      ) : (
        <Lock className="h-4 w-4 mr-2" />
      )}
      {isPublic ? 'Public' : 'Private'}
    </Button>
  );
}
