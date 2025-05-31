
"use client";

import type { TimelineEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import CountdownBadge from './CountdownBadge';
import { format, formatDistanceStrict, isValid, differenceInDays, isPast } from 'date-fns';
import { BookOpen, CalendarClock, Edit3, Trash2, Zap, AlertOctagon, Sparkles, Milestone, Star, CheckCircle2, AlertTriangle, XOctagon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: TimelineEvent;
  previousEventDueDate?: Date | string | null; 
  isNextUpcoming?: boolean;
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (eventId: string) => void;
  isOwner: boolean;
  className?: string;
}

const getIconForEvent = (title: string, isEventOverdue: boolean, isNextUpcoming?: boolean) => {
  const lowerTitle = title.toLowerCase();
  if (isEventOverdue) return <XOctagon className="h-5 w-5 text-overdue-status-foreground" />;
  if (isNextUpcoming) return <Zap className="h-5 w-5 text-warning-foreground" />; // Primary for next upcoming
  if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('deadline')) return <AlertOctagon className="h-5 w-5 text-destructive" />;
  if (lowerTitle.includes('milestone')) return <Milestone className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('assignment') || lowerTitle.includes('project') || lowerTitle.includes('lab')) return <BookOpen className="h-5 w-5 text-secondary" />; 
  if (lowerTitle.includes('meeting') || lowerTitle.includes('appointment')) return <CalendarClock className="h-5 w-5 text-accent" />;
  return <Sparkles className="h-5 w-5 text-primary" />;
};

const getEventStatus = (dueDate: Date, isCompletedPlaceholder: boolean = false): 'urgent' | 'warning' | 'neutral' | 'complete' | 'overdue' => {
    const now = new Date();
    if (isPast(dueDate) && !isCompletedPlaceholder) return 'overdue';
    if (isCompletedPlaceholder) return 'complete';

    const daysUntilDue = differenceInDays(dueDate, now);
    if (daysUntilDue <= 2) return 'urgent';
    if (daysUntilDue <= 7) return 'warning';
    return 'neutral';
};

export default function EventCard({ event, previousEventDueDate, isNextUpcoming, onEdit, onDelete, isOwner, className }: EventCardProps) {
  const eventDueDate = event.dueDate;
  const eventStatus = getEventStatus(eventDueDate); // Assuming isCompleted is false for now
  const isEventOverdue = eventStatus === 'overdue';

  let gapIndicator = null;
  if (previousEventDueDate) {
    const prevDueDate = previousEventDueDate instanceof Date ? previousEventDueDate : new Date(previousEventDueDate);
    if (isValid(eventDueDate) && isValid(prevDueDate) && eventDueDate > prevDueDate) {
       gapIndicator = formatDistanceStrict(eventDueDate, prevDueDate, { roundingMethod: 'ceil' });
    }
  }
  
  const cardClasses = cn(
    'neo-card w-full rounded-none rounded-tr-[4px]', 
    {
      'border-destructive bg-destructive/5': eventStatus === 'urgent',
      'border-warning bg-warning/5': eventStatus === 'warning',
      'border-neutral-status bg-neutral-status/5': eventStatus === 'neutral',
      'border-complete-status bg-complete-status/10 opacity-80': eventStatus === 'complete',
      'border-overdue-status bg-overdue-status/10': eventStatus === 'overdue',
      'border-primary shadow-neo-hover scale-[1.02]': isNextUpcoming && !isEventOverdue, // Highlight next upcoming with primary border
    },
    isNextUpcoming && 'animate-pulse-strong-border',
    className
  );

  const titleClasses = cn(
    'text-lg font-archivo flex items-center gap-2.5',
    { 
      'text-overdue-status-foreground': eventStatus === 'overdue',
      'text-foreground': eventStatus !== 'overdue',
      'line-through text-muted-foreground': eventStatus === 'complete'
    }
  );

  return (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 pt-4 px-4">
        <div className="flex-1">
          <CardTitle className={titleClasses}>
            {getIconForEvent(event.title, isEventOverdue, isNextUpcoming)}
            <span className="leading-tight">{event.title}</span>
            {isEventOverdue && <span className="text-xs font-space-mono uppercase text-overdue-status-foreground bg-overdue-status px-2 py-0.5 rounded-[4px] shadow-neo-active ml-2">OVERDUE</span>}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 ml-[calc(1.25rem_+_0.625rem)] font-space-mono">
            Due: {isValid(eventDueDate) ? format(eventDueDate, 'MMM d, yyyy, h:mm a') : "Invalid Date"}
          </CardDescription>
        </div>
        {isValid(eventDueDate) && eventStatus !== 'complete' && !isEventOverdue && <CountdownBadge dueDate={eventDueDate} />}
        {eventStatus === 'complete' && <CheckCircle2 className="h-6 w-6 text-complete-status" />}
      </CardHeader>
      <CardContent className="pt-1 pb-3 px-4">
        {event.description && <p className={cn("text-sm text-card-foreground/90 whitespace-pre-wrap mb-2 ml-[calc(1.25rem_+_0.625rem)] text-body-md", {'text-muted-foreground': eventStatus === 'complete' || isEventOverdue})}>{event.description}</p>}
        {gapIndicator && (
          <p className="text-xs text-muted-foreground italic ml-[calc(1.25rem_+_0.625rem)] font-space-mono">
            <CalendarClock className="inline h-3 w-3 mr-1" />
            {gapIndicator} after previous event.
          </p>
        )}
      </CardContent>
      {isOwner && (onEdit || onDelete) && (
        <CardFooter className="flex justify-end gap-2 pt-2 pb-3 px-4">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(event)} className="neo-button-outline text-xs px-3 py-1">
              <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(event.id)} className="neo-button-destructive text-xs px-3 py-1">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
    
