
"use client";

import type { TimelineEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import CountdownBadge from './CountdownBadge';
import { format, isValid, differenceInDays, isPast } from 'date-fns';
import { BookOpen, CalendarClock, Edit3, Trash2, Zap, Milestone, Sparkles, CheckCircle2, XOctagon, AlertTriangle } from 'lucide-react';
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

const getIconForEventTitle = (title: string) => { 
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('deadline')) return <AlertTriangle className="h-5 w-5 text-destructive" />;
  if (lowerTitle.includes('milestone')) return <Milestone className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('assignment') || lowerTitle.includes('project') || lowerTitle.includes('lab')) return <BookOpen className="h-5 w-5 text-secondary" />; 
  if (lowerTitle.includes('meeting') || lowerTitle.includes('appointment')) return <CalendarClock className="h-5 w-5 text-accent" />;
  return <Sparkles className="h-5 w-5 text-primary" />; 
};

const getEventStatus = (dueDate: Date, isCompletedPlaceholder: boolean = false): 'urgent' | 'warning' | 'neutral' | 'complete' | 'overdue' => {
    const now = new Date();
    if (isCompletedPlaceholder) return 'complete';
    if (isPast(dueDate)) return 'overdue';

    const daysUntilDue = differenceInDays(dueDate, now);
    if (daysUntilDue <= 2) return 'urgent';
    if (daysUntilDue <= 7) return 'warning';
    return 'neutral';
};

export default function EventCard({ event, isNextUpcoming, onEdit, onDelete, isOwner, className }: EventCardProps) {
  const isEventCompleted = false; // Placeholder
  const eventDueDate = event.dueDate;
  const eventStatus = getEventStatus(eventDueDate, isEventCompleted);
  const isEventOverdue = eventStatus === 'overdue';

  const cardClasses = cn(
    'neo-card w-full rounded-none rounded-tr-[4px] overflow-hidden relative', 
    {
      'border-destructive bg-destructive/10': eventStatus === 'urgent' && !isEventOverdue && !isNextUpcoming,
      'border-warning bg-warning/10': eventStatus === 'warning' && !isEventOverdue && !isNextUpcoming,
      'border-neutral-status bg-neutral-status/5': eventStatus === 'neutral' && !isEventOverdue && !isNextUpcoming,
      'border-complete-status bg-complete-status/10': eventStatus === 'complete',
      'opacity-70': isEventOverdue,
      'shadow-neo-primary border-primary': isNextUpcoming && !isEventOverdue, 
    },
    className
  );
  
  const titleClasses = cn(
    'text-2xl font-archivo flex items-center gap-2.5 leading-tight',
    { 
      'text-foreground': eventStatus !== 'overdue' && eventStatus !== 'complete',
      'line-through text-muted-foreground': isEventOverdue,
      'line-through text-complete-status-foreground': eventStatus === 'complete' 
    }
  );

  const descriptionClasses = cn(
    "text-body-md text-card-foreground/90 whitespace-pre-wrap mb-3", 
    {
      'line-through text-muted-foreground': isEventOverdue,
      'line-through': eventStatus === 'complete' 
    }
  );
  
  const contentWrapperClasses = cn(
    {'opacity-70': isEventOverdue && !isNextUpcoming} // Dim content if overdue, but not if it's also the next upcoming (edge case)
  );

  return (
    <Card 
    style={{
      background: isNextUpcoming ? 'linear-gradient(135deg,#f6fffa,#defaea)' : 'transparent',
     }}
    className={cardClasses}>
      {isEventOverdue && (
        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground font-archivo p-1 px-3 text-xs border-2 border-strong-border-color shadow-neo-active rounded-[4px] z-10">
          OVERDUE
        </div>
      )}
      <div className={contentWrapperClasses}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 pt-4 px-4 relative">
          <div className="flex-1 min-w-0"> {/* Added min-w-0 for better flex handling of long titles */}
            <CardTitle className={titleClasses}>
              {/* Icon removed from here based on feedback */}
              <span>{event.title}</span>
            </CardTitle>
          </div>
          {isValid(eventDueDate) && eventStatus !== 'complete' && !isEventOverdue && <CountdownBadge dueDate={eventDueDate} />}
          {eventStatus === 'complete' && <CheckCircle2 className="h-6 w-6 text-complete-status flex-shrink-0" />}
        </CardHeader>

        <CardContent className={cn("pt-1 pb-3 px-4")}>
          {event.description && 
            <p className={descriptionClasses}>
              {event.description}
            </p>
          }
          <div className={cn(
            "mt-2 p-2 bg-muted/30 border border-strong-border-color/30 rounded-[4px] inline-block",
            {'line-through text-muted-foreground': eventStatus === 'complete' || isEventOverdue }
          )}>
            <span className="text-body-sm text-muted-foreground font-space-mono">
              Due: {isValid(eventDueDate) ? format(eventDueDate, 'MMM d, yyyy, h:mm a') : "Invalid Date"}
            </span>
          </div>
        </CardContent>
      </div>

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
    
