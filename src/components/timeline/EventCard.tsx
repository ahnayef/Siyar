
"use client";

import type { TimelineEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import CountdownBadge from './CountdownBadge';
import { format, formatDistanceStrict, isValid } from 'date-fns';
import { BookOpen, CalendarClock, Edit3, Trash2, Zap, AlertOctagon, Sparkles, Milestone } from 'lucide-react';
import { Button } from '../ui/button';

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
  if (isNextUpcoming) return <Zap className="h-5 w-5 text-secondary" />; // Orange Zap for upcoming
  if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('deadline')) return <AlertOctagon className="h-5 w-5 text-destructive" />;
  if (lowerTitle.includes('milestone')) return <Milestone className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('assignment') || lowerTitle.includes('project') || lowerTitle.includes('lab')) return <BookOpen className="h-5 w-5 text-primary" />; 
  if (lowerTitle.includes('meeting') || lowerTitle.includes('appointment')) return <CalendarClock className="h-5 w-5 text-secondary" />;
  return <Sparkles className="h-5 w-5 text-primary" />;
};

export default function EventCard({ event, previousEventDueDate, isNextUpcoming, onEdit, onDelete, isOwner, className }: EventCardProps) {
  const eventDueDate = event.dueDate;

  let gapIndicator = null;
  if (previousEventDueDate) {
    const prevDueDate = previousEventDueDate instanceof Date ? previousEventDueDate : new Date(previousEventDueDate);
    if (isValid(eventDueDate) && isValid(prevDueDate) && eventDueDate > prevDueDate) {
       gapIndicator = formatDistanceStrict(eventDueDate, prevDueDate, { roundingMethod: 'ceil' });
    }
  }
  
  const cardClasses = `neo-card w-full 
    ${isNextUpcoming ? 'border-primary' : 'border-strong-border'} 
    ${className}`;

  return (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 pt-4 px-4">
        <div className="flex-1">
          <CardTitle className="text-lg font-bold flex items-center gap-2.5 text-foreground">
            {getIconForEvent(event.title, isNextUpcoming)}
            <span className="leading-tight">{event.title}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 ml-[calc(1.25rem_+_0.625rem)]"> {/* Align with text, not icon */}
            Due: {isValid(eventDueDate) ? format(eventDueDate, 'MMM d, yyyy, h:mm a') : "Invalid Date"}
          </CardDescription>
        </div>
        {isValid(eventDueDate) && <CountdownBadge dueDate={eventDueDate} />}
      </CardHeader>
      <CardContent className="pt-1 pb-3 px-4">
        {event.description && <p className="text-sm text-card-foreground/90 whitespace-pre-wrap mb-2 ml-[calc(1.25rem_+_0.625rem)]">{event.description}</p>}
        {gapIndicator && (
          <p className="text-xs text-muted-foreground italic ml-[calc(1.25rem_+_0.625rem)]">
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
