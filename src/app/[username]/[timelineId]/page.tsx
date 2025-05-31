
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { Timeline, TimelineEvent, UserProfile } from '@/types';
import { getTimelineByUsernameAndId, getTimelineEvents, getUserByUsername } from '@/lib/firestoreOps';
import HeaderBar from '@/components/timeline/HeaderBar';
import EventCard from '@/components/timeline/EventCard';
import AddEventModal from '@/components/timeline/AddEventModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarPlus, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteTimelineEventAction } from '@/actions/timelineActions';

export default function TimelineViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const username = typeof params.username === 'string' ? params.username : '';
  const timelineId = typeof params.timelineId === 'string' ? params.timelineId : '';

  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<TimelineEvent | null>(null);
  
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!username || !timelineId) {
      setError("Invalid URL parameters.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedOwnerProfile = await getUserByUsername(username);
        if (!fetchedOwnerProfile) {
            throw new Error("Timeline owner not found.");
        }
        setOwnerProfile(fetchedOwnerProfile);

        const timelineData = await getTimelineByUsernameAndId(username, timelineId);

        if (!timelineData) {
          throw new Error("Timeline not found or you may not have access.");
        }
        
        if (!timelineData.isPublic && (!authUser || authUser.uid !== timelineData.userId)) {
          throw new Error("This timeline is private. Access denied.");
        }
        
        setTimeline(timelineData);
        const eventData = await getTimelineEvents(timelineId);
        // Ensure events are sorted by due date after fetching
        setEvents(eventData.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));

      } catch (err: any) {
        console.error("Error fetching timeline data:", err);
        setError(err.message || "Failed to load timeline.");
        if (toast) { 
          toast({ title: "Error", description: err.message || "Failed to load timeline.", variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) { // Only fetch data once auth state is resolved
        fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, timelineId, authUser, authLoading]); // toast removed to prevent excessive calls on toast obj change

  const isOwner = useMemo(() => authUser?.uid === timeline?.userId, [authUser, timeline]);

  const handleAddEventClick = () => {
    if (!isOwner) return;
    setEventToEdit(null);
    setIsAddEventModalOpen(true);
  };

  const handleEditEvent = (event: TimelineEvent) => {
    if (!isOwner) return;
    setEventToEdit(event);
    setIsAddEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!timeline || !authUser) {
        toast({ title: "Error", description: "Timeline or user data not available.", variant: "destructive"});
        return;
    }
    if (!isOwner) {
        toast({ title: "Unauthorized", description: "You cannot delete events from this timeline.", variant: "destructive"});
        return;
    }
    if (window.confirm("Are you sure you want to delete this event? This action is irreversible.")) {
      try {
        await deleteTimelineEventAction(authUser.uid, timeline.id, eventId);
        setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
        toast({ title: "Event Deleted", description: "The event has been removed." });
      } catch (err: any) {
        toast({ title: "Error Deleting Event", description: err.message, variant: "destructive" });
      }
    }
  };

  const handleEventAddedOrUpdated = (newEventOrUpdatedEvent: TimelineEvent) => {
    const processedEvent = {
      ...newEventOrUpdatedEvent,
      // Ensure dueDate is a Date object, might already be if types are consistent
      dueDate: new Date(newEventOrUpdatedEvent.dueDate) 
    };

    if (timeline) { // Check if timeline is loaded
      setEvents(prevEvents => {
        const existingEventIndex = prevEvents.findIndex(e => e.id === processedEvent.id);
        let newEventsList;
        if (existingEventIndex > -1) {
          newEventsList = [...prevEvents];
          newEventsList[existingEventIndex] = processedEvent;
        } else {
          newEventsList = [...prevEvents, processedEvent];
        }
        // Sort events by due date after adding/updating
        return newEventsList.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      });
    }
  };
  
  // Memoize the calculation of the next upcoming event ID
  const nextUpcomingEventId = useMemo(() => {
    const now = new Date();
    const upcoming = events
      .filter(event => event.dueDate.getTime() > now.getTime())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Already sorted, but good to be sure
    return upcoming.length > 0 ? upcoming[0].id : null;
  }, [events]);


  if (authLoading || (isLoading && !error && !timeline && !params.username && !params.timelineId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4 bg-muted/50 rounded-[4px]" />
        <Skeleton className="h-8 w-1/4 mb-8 bg-muted/50 rounded-[4px]" /> 
        <div className="space-y-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start">
              <div className="flex flex-col items-center mr-6 mt-1">
                <Skeleton className="w-8 h-8 bg-primary/30 rounded-sm" /> {/* Square dot */}
                <Skeleton className="w-1.5 h-24 mt-2 bg-strong-border-color/30 rounded-sm" /> {/* Stem */}
              </div>
              <Skeleton className="h-40 w-full rounded-[4px] flex-1 bg-card/80 border-2 border-strong-border-color/20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="neo-card p-8">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-destructive">Access Denied or Not Found</h2>
          <p className="text-muted-foreground mb-6 text-body-md">{error}</p>
          <Button onClick={() => router.push('/dashboard')} className="neo-button">Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!timeline) { // Should be caught by error state if timelineData is null due to access
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="neo-card p-8">
          <Smile className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-muted-foreground">Timeline Loading...</h2>
          <p className="text-muted-foreground mb-6 text-body-md">Just a moment, fetching the details.</p>
           <Button onClick={() => router.push('/dashboard')} className="neo-button">Go to Dashboard</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background min-h-screen">
      <HeaderBar timeline={timeline} onAddEventClick={handleAddEventClick} />
      <div className="container mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-12 neo-card">
            <CalendarPlus className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-primary mb-3">Timeline Is Empty!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-body-md">
              This timeline is awaiting its first event. {isOwner ? "Add an event to get started." : "The creator hasn't added any events yet."}
            </p>
            {isOwner && <Button size="lg" onClick={handleAddEventClick} className="neo-button">Add First Event</Button>}
          </div>
        ) : (
          <div className="relative pl-5"> 
            {events.map((event, index) => (
              <div key={event.id} className="flex items-start mb-12 relative">
                {/* Event Marker (Square) & Stem */}
                <div className="absolute left-[-20px] top-1 flex flex-col items-center h-full">
                  <div className={cn(`
                    w-6 h-6 border-2 bg-card flex-shrink-0 z-10 rounded-sm
                    shadow-neo-active`,
                    event.id === nextUpcomingEventId 
                      ? 'border-primary bg-primary/20 animate-pulse-strong-border' 
                      : 'border-strong-border-color bg-muted'
                  )}></div>
                  {/* Vertical Line connecting to next event */}
                  {index < events.length - 1 && (
                    <div className="w-1 flex-grow bg-strong-border-color mt-1 min-h-[calc(100%_-_1.5rem)]"></div>
                  )}
                </div>

                {/* Event Card (takes remaining space) */}
                <div className="flex-1 min-w-0 ml-8"> 
                  <EventCard
                    event={event}
                    previousEventDueDate={index > 0 ? events[index - 1].dueDate : null}
                    isNextUpcoming={event.id === nextUpcomingEventId}
                    onEdit={isOwner ? handleEditEvent : undefined}
                    onDelete={isOwner ? handleDeleteEvent : undefined}
                    isOwner={isOwner}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isOwner && timeline && (
        <AddEventModal
          timelineId={timeline.id}
          isOpen={isAddEventModalOpen}
          setIsOpen={setIsAddEventModalOpen}
          eventToEdit={eventToEdit}
          onEventAddedOrUpdated={handleEventAddedOrUpdated}
        />
      )}
    </div>
  );
}
    
