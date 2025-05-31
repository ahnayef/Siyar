
"use client";

import type { TimelineEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import CountdownBadge from './CountdownBadge';
import { format, formatDistanceStrict, isValid } from 'date-fns';
import { BookOpen, CalendarClock, Edit3, Trash2, Zap, AlertOctagon, ShieldCheck, Sparkles } from 'lucide-react'; // Changed some icons
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
  if (isNextUpcoming) return <Zap className="h-5 w-5 text-primary" />; // Yellow Zap for upcoming
  if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('deadline')) return <AlertOctagon className="h-5 w-5 text-destructive" />;
  if (lowerTitle.includes('assignment') || lowerTitle.includes('project') || lowerTitle.includes('lab')) return <BookOpen className="h-5 w-5 text-accent" />; // Cyan BookOpen
  if (lowerTitle.includes('meeting') || lowerTitle.includes('appointment') || lowerTitle.includes('milestone')) return <CalendarClock className="h-5 w-5 text-secondary" />; // Pink CalendarClock
  return <Sparkles className="h-5 w-5 text-primary" />; // Yellow Sparkles as default
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
  
  const cardClasses = `neo-card rounded-lg w-full 
    ${isNextUpcoming ? 'border-primary shadow-[6px_6px_0px_0px_hsl(var(--primary))]' : 'border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]'} 
    ${className}`;

  return (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex-1">
          <CardTitle className="text-xl font-bold flex items-center gap-3 text-primary">
            {getIconForEvent(event.title, isNextUpcoming)}
            <span className="leading-tight">{event.title}</span>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Due: {isValid(eventDueDate) ? format(eventDueDate, 'MMM d, yyyy, h:mm a') : "Invalid Date"}
          </CardDescription>
        </div>
        {isValid(eventDueDate) && <CountdownBadge dueDate={eventDueDate} />}
      </CardHeader>
      <CardContent className="pt-0">
        {event.description && <p className="text-card-foreground/90 whitespace-pre-wrap mb-3">{event.description}</p>}
        {gapIndicator && (
          <p className="text-xs text-muted-foreground italic">
            <CalendarClock className="inline h-3 w-3 mr-1" />
            {gapIndicator} after previous event.
          </p>
        )}
      </CardContent>
      {isOwner && (onEdit || onDelete) && (
        <CardFooter className="flex justify-end gap-2 pt-3">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(event)} className="neo-button bg-card text-card-foreground hover:bg-muted hover:text-muted-foreground border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
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
