
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
import { Loader2, CalendarIcon, Sparkles } from 'lucide-react';
import type { TimelineEvent } from '@/types';
import { format } from 'date-fns';
import { addEventToTimelineAction, updateTimelineEventAction } from '@/actions/timelineActions';
import { useAuth } from '@/hooks/useAuth';
import { enhanceEventDetails, type EnhanceEventDetailsInput } from '@/ai/flows/enhance-event-details-flow';

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

  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [isSuggestingDescription, setIsSuggestingDescription] = useState(false);
  const [titleSuggestionsOpen, setTitleSuggestionsOpen] = useState(false);
  const [descriptionSuggestionsOpen, setDescriptionSuggestionsOpen] = useState(false);

  const [hasUsedAITitle, setHasUsedAITitle] = useState(false);
  const [hasUsedAIDescription, setHasUsedAIDescription] = useState(false);


  const { control, register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: undefined,
    }
  });

  useEffect(() => {
    if (isOpen) { 
      if (eventToEdit) {
        setValue('title', eventToEdit.title);
        setValue('description', eventToEdit.description || '');
        setValue('dueDate', eventToEdit.dueDate ? new Date(eventToEdit.dueDate) : undefined);
      } else {
        reset({ title: '', description: '', dueDate: undefined });
      }
      setTitleSuggestions([]);
      setDescriptionSuggestions([]);
      setTitleSuggestionsOpen(false);
      setDescriptionSuggestionsOpen(false);
      setHasUsedAITitle(false); 
      setHasUsedAIDescription(false);
    }
  }, [eventToEdit, isOpen, reset, setValue]);

  const handleSuggest = async (type: 'title' | 'description') => {
    const currentText = getValues(type);
    const contextText = type === 'title' ? getValues('description') : getValues('title');

    if (type === 'title') setIsSuggestingTitle(true);
    if (type === 'description') setIsSuggestingDescription(true);

    try {
      const result = await enhanceEventDetails({
        currentText: currentText || (type === 'title' ? 'New Event' : 'Details about the event.'),
        enhancementType: type,
        contextText: contextText || undefined,
      });
      if (type === 'title') {
        setTitleSuggestions(result.suggestions);
        setTitleSuggestionsOpen(true);
        setHasUsedAITitle(true);
      } else {
        setDescriptionSuggestions(result.suggestions);
        setDescriptionSuggestionsOpen(true);
        setHasUsedAIDescription(true);
      }
    } catch (error: any) {
      toast({
        title: `Error getting ${type} suggestions`,
        description: error.message || "Could not connect to AI service.",
        variant: "destructive",
      });
    } finally {
      if (type === 'title') setIsSuggestingTitle(false);
      if (type === 'description') setIsSuggestingDescription(false);
    }
  };

  const applySuggestion = (type: 'title' | 'description', suggestion: string) => {
    setValue(type, suggestion);
    if (type === 'title') {
      setTitleSuggestionsOpen(false);
      setTitleSuggestions([]);
    } else {
      setDescriptionSuggestionsOpen(false);
      setDescriptionSuggestions([]);
    }
  };


  const handleFormSubmit: SubmitHandler<EventFormData> = async (data) => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      let savedEvent: TimelineEvent;
      const eventPayload = {
        ...data,
        description: data.description || "", 
      };

      if (eventToEdit) {
        savedEvent = await updateTimelineEventAction(user.uid, timelineId, eventToEdit.id, eventPayload);
      } else {
        savedEvent = await addEventToTimelineAction(user.uid, timelineId, eventPayload);
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
  
  const onModalOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) { 
        setTitleSuggestions([]);
        setDescriptionSuggestions([]);
        setTitleSuggestionsOpen(false);
        setDescriptionSuggestionsOpen(false);
        setHasUsedAITitle(false);
        setHasUsedAIDescription(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onModalOpenChange}>
      <DialogContent className="neo-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-archivo text-primary">{eventToEdit ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="title" className="text-card-foreground font-semibold font-inter">Title</Label>
              <Popover open={titleSuggestionsOpen} onOpenChange={setTitleSuggestionsOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleSuggest('title')} disabled={isSuggestingTitle || hasUsedAITitle} className="px-2 py-1 text-xs text-primary hover:bg-primary/10">
                    {isSuggestingTitle ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                    AI Suggest {hasUsedAITitle && "(Used)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 space-y-1 neo-card" align="end">
                  {isSuggestingTitle ? <p className="text-sm text-muted-foreground p-2">Generating...</p> : 
                    titleSuggestions.length > 0 ? titleSuggestions.map((s, i) => (
                    <Button key={i} variant="ghost" size="sm" className="w-full justify-start text-left h-auto py-1.5 px-2 neo-button-outline border-muted hover:border-primary" onClick={() => applySuggestion('title', s)}>{s}</Button>
                  )) : <p className="text-sm text-muted-foreground p-2">No suggestions yet or failed to load.</p>}
                </PopoverContent>
              </Popover>
            </div>
            <Input id="title" {...register('title')} className="neo-input" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="description" className="text-card-foreground font-semibold font-inter">Description</Label>
               <Popover open={descriptionSuggestionsOpen} onOpenChange={setDescriptionSuggestionsOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleSuggest('description')} disabled={isSuggestingDescription || hasUsedAIDescription} className="px-2 py-1 text-xs text-primary hover:bg-primary/10">
                    {isSuggestingDescription ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                    AI Suggest {hasUsedAIDescription && "(Used)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-sm p-2 space-y-1 neo-card" align="end">
                  {isSuggestingDescription ? <p className="text-sm text-muted-foreground p-2">Generating...</p> :
                  descriptionSuggestions.length > 0 ? descriptionSuggestions.map((s, i) => (
                    <Button key={i} variant="ghost" size="sm" className="w-full justify-start text-left h-auto whitespace-pre-wrap py-1.5 px-2 neo-button-outline border-muted hover:border-primary" onClick={() => applySuggestion('description', s)}>{s}</Button>
                  )) : <p className="text-sm text-muted-foreground p-2">No suggestions yet or failed to load.</p>}
                </PopoverContent>
              </Popover>
            </div>
            <Textarea id="description" {...register('description')} className="neo-input" rows={3} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-1">
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

