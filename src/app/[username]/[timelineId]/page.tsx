
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
import { Lock, AlertTriangle, Unlock } from 'lucide-react';
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
          throw new Error("This timeline is private.");
        }
        
        setTimeline(timelineData);
        const eventData = await getTimelineEvents(timelineId);
        setEvents(eventData.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));

      } catch (err: any) {
        console.error("Error fetching timeline data:", err);
        setError(err.message || "Failed to load timeline.");
        toast({ title: "Error", description: err.message || "Failed to load timeline.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
        fetchData();
    }
  }, [username, timelineId, authUser, authLoading, toast]);

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
    if (window.confirm("Are you sure you want to delete this event?")) {
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
      .filter(event => event.dueDate > now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    return upcoming.length > 0 ? upcoming[0].id : null;
  };

  const nextUpcomingEventId = useMemo(() => getNextUpcomingEventId(events), [events]);

  const isOwner = authUser?.uid === timeline?.userId;

  if (authLoading || (isLoading && !error && !timeline)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-8 w-1/4 mb-8" /> 
        <div className="space-y-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start">
              <div className="flex flex-col items-center mr-4 mt-1">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-1 h-20 mt-1" />
              </div>
              <Skeleton className="h-40 w-full rounded-lg flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="neo-card p-8 rounded-lg">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-destructive">Access Denied or Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')} className="neo-button">Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!timeline) {
    return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Timeline data not available.</div>;
  }
  
  return (
    <div>
      <HeaderBar timeline={timeline} onAddEventClick={handleAddEventClick} />
      <div className="container mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-12 neo-card rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mx-auto mb-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
            <h2 className="text-2xl font-semibold mb-2">No Events Yet!</h2>
            <p className="text-muted-foreground mb-4">This timeline is empty. {isOwner ? "Add some events to get started." : ""}</p>
            {isOwner && <Button onClick={handleAddEventClick} className="neo-button">Add First Event</Button>}
          </div>
        ) : (
          <div className="space-y-10"> {/* Vertical stack of events */}
            {events.map((event, index) => (
              <div key={event.id} className="flex items-start">
                {/* Timeline stem and dot */}
                <div className="flex flex-col items-center mr-6 shrink-0"> {/* Increased margin, shrink-0 */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 bg-card flex-shrink-0 mt-1
                    ${event.id === nextUpcomingEventId ? 'border-accent ring-2 ring-accent shadow-neo-lg' : 'border-foreground shadow-md'}
                  `}></div>
                  {index < events.length - 1 && (
                    <div className="w-1 flex-grow bg-foreground mt-1 min-h-[4rem]"></div> {/* Ensure line has some height */}
                  )}
                </div>
                {/* Event Card */}
                <div className="flex-1 min-w-0"> {/* min-w-0 for flex child */}
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
