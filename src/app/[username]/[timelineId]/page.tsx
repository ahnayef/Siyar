
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { Timeline, TimelineEvent, UserProfile } from '@/types';
import { getTimelineByUsernameAndId, getTimelineEvents, getUserByUsername } from '@/lib/firestoreOps';
import HeaderBar from '@/components/timeline/HeaderBar';
import EventCard from '@/components/timeline/EventCard';
import AddEventModal from '@/components/timeline/AddEventModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarPlus } from 'lucide-react';
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
          throw new Error("Timeline not found.");
        }
        
        if (!timelineData.isPublic && (!authUser || authUser.uid !== timelineData.userId)) {
          throw new Error("This timeline is private. Access denied.");
        }
        
        setTimeline(timelineData);
        const eventData = await getTimelineEvents(timelineId);
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

    if (!authLoading) {
        fetchData();
    }
  }, [username, timelineId, authUser, authLoading, toast]);

  const isOwner = authUser?.uid === timeline?.userId;

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
      dueDate: new Date(newEventOrUpdatedEvent.dueDate) 
    };

    if (timeline) {
      setEvents(prevEvents => {
        const existingEventIndex = prevEvents.findIndex(e => e.id === processedEvent.id);
        let newEventsList;
        if (existingEventIndex > -1) {
          newEventsList = [...prevEvents];
          newEventsList[existingEventIndex] = processedEvent;
        } else {
          newEventsList = [...prevEvents, processedEvent];
        }
        return newEventsList.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      });
    }
  };
  
  const getNextUpcomingEventId = (currentEvents: TimelineEvent[]) => {
    const now = new Date();
    const upcoming = currentEvents
      .filter(event => event.dueDate.getTime() > now.getTime())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    return upcoming.length > 0 ? upcoming[0].id : null;
  };

  const nextUpcomingEventId = useMemo(() => getNextUpcomingEventId(events), [events]);

  if (authLoading || (isLoading && !error && !timeline && !params.username && !params.timelineId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4 bg-muted/50" />
        <Skeleton className="h-8 w-1/4 mb-8 bg-muted/50" /> 
        <div className="space-y-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start">
              <div className="flex flex-col items-center mr-6 mt-1">
                <Skeleton className="w-8 h-8 bg-muted/50 rounded-sm" /> {/* Square dot */}
                <Skeleton className="w-1.5 h-24 mt-2 bg-muted/50" /> {/* Stem */}
              </div>
              <Skeleton className="h-40 w-full rounded-lg flex-1 bg-muted/30" />
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
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')} className="neo-button">Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="neo-card p-8">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-muted-foreground">Timeline Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested timeline could not be loaded.</p>
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
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This timeline is awaiting its first event. {isOwner ? "Add an event to get started." : "The creator hasn't added any events yet."}
            </p>
            {isOwner && <Button size="lg" onClick={handleAddEventClick} className="neo-button">Add First Event</Button>}
          </div>
        ) : (
          <div className="relative pl-5"> {/* Padding for the stem and markers */}
            {events.map((event, index) => (
              <div key={event.id} className="flex items-start mb-12 relative">
                {/* Event Marker (Square) & Stem */}
                <div className="absolute left-[-20px] top-1 flex flex-col items-center h-full">
                  <div className={`
                    w-6 h-6 border-2 bg-card flex-shrink-0 z-10 rounded-sm
                    ${event.id === nextUpcomingEventId 
                      ? 'border-primary bg-primary shadow-neo-button-light' 
                      : 'border-strong-border bg-muted shadow-neo-button-light'}
                  `}></div>
                  {/* Vertical Line connecting to next event */}
                  {index < events.length - 1 && (
                    <div className="w-1 flex-grow bg-strong-border mt-1 min-h-[calc(100%_-_1.5rem)]"></div>
                  )}
                </div>

                {/* Event Card (takes remaining space) */}
                <div className="flex-1 min-w-0 ml-8"> {/* Margin to accommodate marker and stem */}
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
