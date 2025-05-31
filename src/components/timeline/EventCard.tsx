
"use client";

import type { TimelineEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import CountdownBadge from './CountdownBadge';
import { format, isValid, differenceInDays, isPast } from 'date-fns';
import { BookOpen, CalendarClock, Edit3, Trash2, Zap, AlertOctagon, Sparkles, Milestone, Star, CheckCircle2, XOctagon, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: TimelineEvent;
  isNextUpcoming?: boolean;
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (eventId: string) => void;
  isOwner: boolean;
  className?: string;
}

const getIconForEvent = (title: string, isEventOverdue: boolean, isNextUpcoming?: boolean, isCompleted?: boolean) => {
  const lowerTitle = title.toLowerCase();
  if (isCompleted) return <CheckCircle2 className="h-5 w-5 text-complete-status" />;
  if (isEventOverdue) return <XOctagon className="h-5 w-5 text-destructive-foreground" />; // Use destructive-foreground for better visibility on overdue bg
  if (isNextUpcoming) return <Zap className="h-5 w-5 text-primary animate-pulse" />;
  if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('deadline')) return <AlertTriangle className="h-5 w-5 text-destructive" />;
  if (lowerTitle.includes('milestone')) return <Milestone className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('assignment') || lowerTitle.includes('project') || lowerTitle.includes('lab')) return <BookOpen className="h-5 w-5 text-secondary" />; 
  if (lowerTitle.includes('meeting') || lowerTitle.includes('appointment')) return <CalendarClock className="h-5 w-5 text-accent" />;
  return <Sparkles className="h-5 w-5 text-primary" />; // Default icon
};

const getEventStatus = (dueDate: Date, isCompletedPlaceholder: boolean = false): 'urgent' | 'warning' | 'neutral' | 'complete' | 'overdue' => {
    const now = new Date();
    // Explicitly treat as complete if placeholder is true
    if (isCompletedPlaceholder) return 'complete';
    // Check for overdue only if not complete
    if (isPast(dueDate)) return 'overdue';

    const daysUntilDue = differenceInDays(dueDate, now);
    if (daysUntilDue <= 2) return 'urgent';
    if (daysUntilDue <= 7) return 'warning';
    return 'neutral';
};

export default function EventCard({ event, isNextUpcoming, onEdit, onDelete, isOwner, className }: EventCardProps) {
  // For this example, let's assume 'isCompleted' might come from event data in future.
  // For now, it's false, so overdue status will take precedence if date is past.
  const isEventCompleted = false; // Placeholder: replace with actual event.isCompleted if available
  const eventDueDate = event.dueDate;
  const eventStatus = getEventStatus(eventDueDate, isEventCompleted);
  const isEventOverdue = eventStatus === 'overdue';

  const cardClasses = cn(
    'neo-card w-full rounded-none rounded-tr-[4px] overflow-hidden', 
    {
      'border-destructive bg-destructive/10': eventStatus === 'urgent' && !isEventOverdue,
      'border-warning bg-warning/10': eventStatus === 'warning' && !isEventOverdue,
      'border-neutral-status bg-neutral-status/5': eventStatus === 'neutral' && !isEventOverdue,
      'border-complete-status bg-complete-status/10 opacity-80': eventStatus === 'complete',
      'border-overdue-status bg-overdue-status/20': eventStatus === 'overdue',
      'border-primary shadow-neo-hover scale-[1.01]': isNextUpcoming && !isEventOverdue,
    },
    isNextUpcoming && !isEventOverdue && 'ring-2 ring-primary ring-offset-2 ring-offset-background', // More emphasis for next upcoming
    className
  );

  const contentOpacity = isEventOverdue ? 'opacity-60' : '';

  const titleClasses = cn(
    'text-xl font-archivo flex items-center gap-2.5 leading-tight',
    { 
      'text-destructive-foreground': eventStatus === 'overdue', // Stronger contrast for overdue title
      'text-foreground': eventStatus !== 'overdue',
      'line-through text-muted-foreground': eventStatus === 'complete'
    },
    contentOpacity 
  );

  return (
    <Card className={cardClasses}>
      {isEventOverdue && (
        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-3 py-1 text-sm font-archivo shadow-neo-active rounded-bl-md rounded-tr-sm z-10 transform rotate-[0deg]">
          OVERDUE
        </div>
      )}
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 pt-4 px-4 relative">
        <div className="flex-1">
          <CardTitle className={titleClasses}>
            {isNextUpcoming && !isEventOverdue && <Star className="h-5 w-5 text-primary fill-primary mr-1 shrink-0" />}
            {getIconForEvent(event.title, isEventOverdue, isNextUpcoming, isEventCompleted)}
            <span>{event.title}</span>
          </CardTitle>
          <CardDescription className={cn("text-body-sm text-muted-foreground mt-1.5 ml-[calc(1.25rem_+_0.625rem_+_0.25rem)] font-space-mono", contentOpacity)}>
            Due: {isValid(eventDueDate) ? format(eventDueDate, 'MMM d, yyyy, h:mm a') : "Invalid Date"}
          </CardDescription>
        </div>
        {isValid(eventDueDate) && eventStatus !== 'complete' && !isEventOverdue && <CountdownBadge dueDate={eventDueDate} />}
        {eventStatus === 'complete' && <CheckCircle2 className="h-6 w-6 text-complete-status" />}
      </CardHeader>
      <CardContent className={cn("pt-1 pb-3 px-4", contentOpacity)}>
        {event.description && <p className={cn("text-body-md text-card-foreground/90 whitespace-pre-wrap mb-2 ml-[calc(1.25rem_+_0.625rem_+_0.25rem)]", {'text-muted-foreground': eventStatus === 'complete' || isEventOverdue})}>{event.description}</p>}
      </CardContent>
      {isOwner && (onEdit || onDelete) && (
        <CardFooter className="flex justify-end gap-2 pt-2 pb-3 px-4 border-t border-strong-border-color/20 mt-2">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(event)} 
              className="neo-button-outline border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary-foreground focus:bg-secondary/10 focus:text-secondary-foreground text-xs px-3 py-1"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(event.id)} 
              className="neo-button-outline border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive-foreground focus:bg-destructive/10 focus:text-destructive-foreground text-xs px-3 py-1"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

