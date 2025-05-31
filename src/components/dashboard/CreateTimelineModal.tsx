
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import { createTimelineAction } from '@/actions/timelineActions';
import { useAuth } from '@/hooks/useAuth';
import type { Timeline } from '@/types';

const timelineSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
});
type TimelineFormData = z.infer<typeof timelineSchema>;

interface CreateTimelineModalProps {
  onTimelineCreated: (newTimeline: Timeline) => void;
}

export default function CreateTimelineModal({ onTimelineCreated }: CreateTimelineModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TimelineFormData>({
    resolver: zodResolver(timelineSchema),
  });

  const handleFormSubmit: SubmitHandler<TimelineFormData> = async (data) => {
    setIsLoading(true);
    if (!user || !userProfile?.username) {
      toast({
        title: "Authentication Error",
        description: "User not logged in or profile incomplete. Please log in again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const newTimeline = await createTimelineAction(user.uid, userProfile.username, data.title);
      if (!newTimeline) throw new Error("Failed to create timeline");

      toast({ title: "Timeline Created!", description: `"${newTimeline.title}" is ready for action.` });
      onTimelineCreated(newTimeline);
      reset();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error Creating Timeline",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="neo-button">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="neo-card sm:max-w-[425px] border-primary shadow-[6px_6px_0px_0px_hsl(var(--primary))]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Forge a New Timeline</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="title" className="text-card-foreground font-semibold">Timeline Title</Label>
            <Input id="title" {...register('title')} className="neo-input" placeholder="e.g., Project Overlord Launch" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" className="neo-button bg-muted text-muted-foreground hover:bg-muted/90 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !user} className="neo-button">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Timeline
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
