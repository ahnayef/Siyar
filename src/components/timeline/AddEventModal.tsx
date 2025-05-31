
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon } from 'lucide-react';
import type { TimelineEvent } from '@/types';
import { format } from 'date-fns';
import { addEventToTimelineAction, updateTimelineEventAction } from '@/actions/timelineActions';
import { useAuth } from '@/hooks/useAuth';

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  dueDate: z.date({ required_error: "Due date is required." }),
});
type EventFormData = z.infer<typeof eventSchema>;

interface AddEventModalProps {
  timelineId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  eventToEdit?: TimelineEvent | null;
  onEventAddedOrUpdated: (event: TimelineEvent) => void;
}

export default function AddEventModal({ timelineId, isOpen, setIsOpen, eventToEdit, onEventAddedOrUpdated }: AddEventModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: undefined,
    }
  });

  useEffect(() => {
    if (eventToEdit) {
      setValue('title', eventToEdit.title);
      setValue('description', eventToEdit.description);
      setValue('dueDate', eventToEdit.dueDate);
    } else {
      reset({ title: '', description: '', dueDate: undefined });
    }
  }, [eventToEdit, isOpen, reset, setValue]);

  const handleFormSubmit: SubmitHandler<EventFormData> = async (data) => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      let savedEvent: TimelineEvent;
      if (eventToEdit) {
        savedEvent = await updateTimelineEventAction(user.uid, timelineId, eventToEdit.id, data);
      } else {
        savedEvent = await addEventToTimelineAction(user.uid, timelineId, data);
      }
      
      toast({ title: eventToEdit ? "Event Updated" : "Event Added", description: `"${data.title}" has been committed.` });
      onEventAddedOrUpdated(savedEvent);
      reset();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error Saving Event",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="neo-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-archivo text-primary">{eventToEdit ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title" className="text-card-foreground font-semibold font-inter">Title</Label>
            <Input id="title" {...register('title')} className="neo-input" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description" className="text-card-foreground font-semibold font-inter">Description</Label>
            <Textarea id="description" {...register('description')} className="neo-input" rows={3} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div>
            <Label htmlFor="dueDate" className="text-card-foreground font-semibold font-inter">Due Date</Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal neo-input text-body-md"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 neo-card border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      initialFocus
                      className="bg-popover text-popover-foreground"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" className="neo-button-outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !user} className="neo-button">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {eventToEdit ? 'Save Changes' : 'Add Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
