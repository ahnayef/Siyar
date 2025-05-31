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
import { Loader2, CalendarIcon, Wand2 } from 'lucide-react';
import type { TimelineEvent } from '@/types';
import { format, parseISO } from 'date-fns';
import { suggestEventTimes } from '@/ai/flows/suggest-event-times';
import { addEventToTimelineAction, updateTimelineEventAction, getAllUserEventsForAIAction } from '@/actions/timelineActions';

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
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState<{ date: string; reasoning: string} | null>(null);
  const { toast } = useToast();

  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: undefined,
    }
  });

  const eventDescriptionForAI = watch('description');

  useEffect(() => {
    if (eventToEdit) {
      setValue('title', eventToEdit.title);
      setValue('description', eventToEdit.description);
      setValue('dueDate', new Date(eventToEdit.dueDate as unknown as string));
    } else {
      reset({ title: '', description: '', dueDate: undefined });
    }
    setAISuggestion(null);
  }, [eventToEdit, isOpen, reset, setValue]);

  const handleFormSubmit: SubmitHandler<EventFormData> = async (data) => {
    setIsLoading(true);
    try {
      let savedEvent: TimelineEvent | null = null;
      if (eventToEdit) {
        savedEvent = await updateTimelineEventAction(timelineId, eventToEdit.id, data);
      } else {
        savedEvent = await addEventToTimelineAction(timelineId, data);
      }

      if (!savedEvent) throw new Error("Failed to save event.");
      
      toast({ title: eventToEdit ? "Event Updated" : "Event Added", description: `"${data.title}" has been saved.` });
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

  const handleAISuggest = async () => {
    if (!eventDescriptionForAI) {
        toast({ title: "AI Suggestion", description: "Please provide an event description first.", variant: "default"});
        return;
    }
    setIsAISuggesting(true);
    setAISuggestion(null);
    try {
        const pastTimelineData = await getAllUserEventsForAIAction();
        const suggestion = await suggestEventTimes({
            timelineData: pastTimelineData,
            newEventDescription: eventDescriptionForAI
        });
        if (suggestion && suggestion.suggestedDate) {
            setAISuggestion({ date: suggestion.suggestedDate, reasoning: suggestion.reasoning});
            setValue('dueDate', parseISO(suggestion.suggestedDate)); // Assuming YYYY-MM-DD
            toast({ title: "AI Suggestion Ready!", description: suggestion.reasoning });
        } else {
            toast({ title: "AI Suggestion", description: "Could not generate a suggestion at this time.", variant: "default"});
        }
    } catch (error: any) {
        console.error("AI Suggestion error:", error);
        toast({ title: "AI Suggestion Error", description: error.message || "Failed to get AI suggestion.", variant: "destructive"});
    } finally {
        setIsAISuggesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setAISuggestion(null); }}>
      <DialogContent className="neo-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">{eventToEdit ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} className="neo-input" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} className="neo-input" rows={3} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal neo-input"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 neo-card" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>

          {aiSuggestion && (
            <div className="p-3 bg-accent/20 border-l-4 border-accent rounded text-sm">
                <p className="font-semibold">AI Suggestion: <span className="font-normal">{format(parseISO(aiSuggestion.date), 'PPP')}</span></p>
                <p className="text-xs text-muted-foreground mt-1">{aiSuggestion.reasoning}</p>
            </div>
          )}

          <Button type="button" onClick={handleAISuggest} disabled={isAISuggesting || !eventDescriptionForAI} variant="outline" className="w-full neo-button bg-secondary text-secondary-foreground hover:bg-secondary/80">
            {isAISuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Suggest Date with AI
          </Button>

          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" className="neo-button bg-muted text-muted-foreground hover:bg-muted/90">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading} className="neo-button">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {eventToEdit ? 'Save Changes' : 'Add Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
