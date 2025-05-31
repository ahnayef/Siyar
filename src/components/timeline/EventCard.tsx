
"use client";

import type { TimelineEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import CountdownBadge from './CountdownBadge';
import { format, formatDistanceStrict, isValid, differenceInDays } from 'date-fns';
import { BookOpen, CalendarClock, Edit3, Trash2, Zap, AlertOctagon, Sparkles, Milestone, Star, CheckCircle2 } from 'lucide-react';
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

const getIconForEvent = (title: string, isNextUpcoming?: boolean) => {
  const lowerTitle = title.toLowerCase();
  if (isNextUpcoming) return <Zap className="h-5 w-5 text-warning" />;
  if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('deadline')) return <AlertOctagon className="h-5 w-5 text-destructive" />;
  if (lowerTitle.includes('milestone')) return <Milestone className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('assignment') || lowerTitle.includes('project') || lowerTitle.includes('lab')) return <BookOpen className="h-5 w-5 text-secondary" />; 
  if (lowerTitle.includes('meeting') || lowerTitle.includes('appointment')) return <CalendarClock className="h-5 w-5 text-accent" />;
  return <Sparkles className="h-5 w-5 text-primary" />;
};

// Function to determine event status for styling
const getEventStatus = (dueDate: Date): 'urgent' | 'warning' | 'neutral' | 'complete' | 'overdue' => {
    const now = new Date();
    if (dueDate < now && !isEventConsideredComplete(dueDate)) return 'overdue'; // Assuming a way to mark complete
    if (isEventConsideredComplete(dueDate)) return 'complete'; // Placeholder

    const daysUntilDue = differenceInDays(dueDate, now);
    if (daysUntilDue <= 2) return 'urgent';
    if (daysUntilDue <= 7) return 'warning';
    return 'neutral';
};
// Placeholder - replace with actual logic if events can be marked complete
const isEventConsideredComplete = (dueDate: Date) => false;


export default function EventCard({ event, previousEventDueDate, isNextUpcoming, onEdit, onDelete, isOwner, className }: EventCardProps) {
  const eventDueDate = event.dueDate;
  const eventStatus = getEventStatus(eventDueDate);

  let gapIndicator = null;
  if (previousEventDueDate) {
    const prevDueDate = previousEventDueDate instanceof Date ? previousEventDueDate : new Date(previousEventDueDate);
    if (isValid(eventDueDate) && isValid(prevDueDate) && eventDueDate > prevDueDate) {
       gapIndicator = formatDistanceStrict(eventDueDate, prevDueDate, { roundingMethod: 'ceil' });
    }
  }
  
  const cardClasses = cn(
    'neo-card w-full rounded-none rounded-tr-[4px]', // Sharp corners with single rounded top-right
    {
      'border-destructive': eventStatus === 'urgent' || eventStatus === 'overdue',
      'border-warning': eventStatus === 'warning',
      'border-neutral-status': eventStatus === 'neutral',
      'border-complete-status': eventStatus === 'complete',
      'border-primary': isNextUpcoming && eventStatus !== 'urgent' && eventStatus !== 'overdue', // Highlight next upcoming if not already urgent/overdue
      'opacity-70 bg-muted': eventStatus === 'complete',
    },
    isNextUpcoming && 'shadow-lg scale-[1.01]', // slight lift and extra shadow for next upcoming
    className
  );

  const titleClasses = cn(
    'text-lg font-archivo flex items-center gap-2.5 text-foreground',
    { 'line-through text-muted-foreground': eventStatus === 'complete'}
  );

  return (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 pt-4 px-4">
        <div className="flex-1">
          <CardTitle className={titleClasses}>
            {getIconForEvent(event.title, isNextUpcoming)}
            <span className="leading-tight">{event.title}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 ml-[calc(1.25rem_+_0.625rem)] font-space-mono">
            Due: {isValid(eventDueDate) ? format(eventDueDate, 'MMM d, yyyy, h:mm a') : "Invalid Date"}
          </CardDescription>
        </div>
        {isValid(eventDueDate) && eventStatus !== 'complete' && <CountdownBadge dueDate={eventDueDate} />}
        {eventStatus === 'complete' && <CheckCircle2 className="h-6 w-6 text-complete-status" />}
      </CardHeader>
      <CardContent className="pt-1 pb-3 px-4">
        {event.description && <p className={cn("text-sm text-card-foreground/90 whitespace-pre-wrap mb-2 ml-[calc(1.25rem_+_0.625rem)] text-body-md", {'text-muted-foreground': eventStatus === 'complete'})}>{event.description}</p>}
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
            <Button variant="destructive" size="sm" onClick={() => onDelete(event.id)} className="neo-button bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs px-3 py-1">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
    