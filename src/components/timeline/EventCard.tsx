
"use client";

import type { TimelineEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import CountdownBadge from './CountdownBadge';
import { format, formatDistanceStrict, isValid } from 'date-fns';
import { BookOpen, CalendarDays, Edit3, Trash2, Flame, Hourglass, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

interface EventCardProps {
  event: TimelineEvent;
  previousEventDueDate?: Date | string | null; // Can be Date or string representation
  isNextUpcoming?: boolean;
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (eventId: string) => void;
  isOwner: boolean;
  className?: string;
}

const getIconForEvent = (title: string) => {
  if (title.toLowerCase().includes('exam') || title.toLowerCase().includes('test')) return <Flame className="h-5 w-5 text-destructive" />;
  if (title.toLowerCase().includes('assignment') || title.toLowerCase().includes('lab')) return <BookOpen className="h-5 w-5 text-blue-500" />;
  if (title.toLowerCase().includes('meeting') || title.toLowerCase().includes('appointment')) return <CalendarDays className="h-5 w-5 text-green-500" />;
  return <CheckCircle2 className="h-5 w-5 text-primary" />;
};

export default function EventCard({ event, previousEventDueDate, isNextUpcoming, onEdit, onDelete, isOwner, className }: EventCardProps) {
  // event.dueDate is now a JS Date object from types/firestoreOps
  const eventDueDate = event.dueDate;

  let gapIndicator = null;
  if (previousEventDueDate) {
    // Ensure previousEventDueDate is a Date object if it's a string
    const prevDueDate = previousEventDueDate instanceof Date ? previousEventDueDate : new Date(previousEventDueDate);
    if (isValid(eventDueDate) && isValid(prevDueDate)) {
       gapIndicator = formatDistanceStrict(eventDueDate, prevDueDate);
    }
  }
  
  const cardClasses = `neo-card rounded-lg w-full animate-event-entry ${isNextUpcoming ? 'border-accent shadow-neo-lg ring-2 ring-accent' : ''} ${className}`;

  return (
    <Card className={cardClasses} style={{ animationDelay: `${Math.random() * 0.3}s` }}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {getIconForEvent(event.title)}
            {event.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Due: {isValid(eventDueDate) ? format(eventDueDate, 'MMM d, yyyy, h:mm a') : "Invalid Date"}
          </CardDescription>
        </div>
        {isValid(eventDueDate) && <CountdownBadge dueDate={eventDueDate} />}
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 whitespace-pre-wrap">{event.description}</p>
        {gapIndicator && (
          <p className="mt-3 text-xs text-muted-foreground italic">
            <Hourglass className="inline h-3 w-3 mr-1" />
            {gapIndicator} after previous event.
          </p>
        )}
      </CardContent>
      {isOwner && (onEdit || onDelete) && (
        <CardFooter className="flex justify-end gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(event)} className="neo-button bg-secondary text-secondary-foreground hover:bg-secondary/80">
              <Edit3 className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(event.id)} className="neo-button">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
