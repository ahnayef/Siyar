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
import { Lock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteTimelineEventAction } from '@/actions/timelineActions';
import { Timestamp } from 'firebase/firestore';

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

        // Use fetchedOwnerProfile.id to query timeline
        const timelineData = await getTimelineByUsernameAndId(username, timelineId);

        if (!timelineData) {
          throw new Error("Timeline not found.");
        }
        
        // Check public/private access
        if (!timelineData.isPublic && (!authUser || authUser.uid !== timelineData.userId)) {
          throw new Error("This timeline is private.");
        }
        
        setTimeline(timelineData);
        const eventData = await getTimelineEvents(timelineId);
        setEvents(eventData.sort((a, b) => (a.dueDate as unknown as Timestamp).toMillis() - (b.dueDate as unknown as Timestamp).toMillis()));

      } catch (err: any) {
        console.error("Error fetching timeline data:", err);
        setError(err.message || "Failed to load timeline.");
        toast({ title: "Error", description: err.message || "Failed to load timeline.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, timelineId, authUser, toast]); // Add authUser to re-check access if auth state changes

  const handleAddEventClick = () => {
    setEventToEdit(null);
    setIsAddEventModalOpen(true);
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setEventToEdit(event);
    setIsAddEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!timeline) return;
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteTimelineEventAction(timeline.id, eventId);
        setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
        toast({ title: "Event Deleted", description: "The event has been removed." });
      } catch (err: any) {
        toast({ title: "Error Deleting Event", description: err.message, variant: "destructive" });
      }
    }
  };

  const handleEventAddedOrUpdated = (newEvent: TimelineEvent) => {
     // Re-fetch events for simplicity or optimistically update
    if (timeline) {
      getTimelineEvents(timeline.id).then(eventData => {
         setEvents(eventData.sort((a, b) => (a.dueDate as unknown as Timestamp).toMillis() - (b.dueDate as unknown as Timestamp).toMillis()));
      });
    }
  };
  
  const nextUpcomingEventId = useMemo(() => {
    const now = new Date();
    const upcomingEvents = events
      .filter(event => (event.dueDate as unknown as Timestamp).toDate() > now)
      .sort((a, b) => (a.dueDate as unknown as Timestamp).toMillis() - (b.dueDate as unknown as Timestamp).toMillis());
    return upcomingEvents.length > 0 ? upcomingEvents[0].id : null;
  }, [events]);


  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" /> {/* HeaderBar Skel */}
        <Skeleton className="h-8 w-1/4 mb-8" /> 
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 md:gap-6 timeline-container-vertical md:timeline-container-horizontal">
          {[1, 2, 3].map(i => (
            <div key={i} className="relative p-2"> {/* For timeline connector positioning */}
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-destructive">Access Denied or Not Found</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/dashboard')} className="neo-button">Go to Dashboard</Button>
      </div>
    );
  }

  if (!timeline) {
    // Should be caught by error state, but as a fallback
    return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Timeline data not available.</div>;
  }
  
  const isOwner = authUser?.uid === timeline.userId;

  // The parent div for events will have the timeline line pseudo-element
  // On mobile (sm breakpoint), it's vertical. On md and up, it's horizontal.
  const eventListContainerClasses = `
    relative 
    py-8 
    sm:ml-6 sm:pl-8 sm:timeline-line-vertical 
    md:ml-0 md:pl-0 md:pt-12 md:timeline-line-horizontal
  `;

  return (
    <div>
      <HeaderBar timeline={timeline} onAddEventClick={handleAddEventClick} />
      <div className="container mx-auto px-2 sm:px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-12 neo-card rounded-lg">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" /> {/* Or some other icon */}
            <h2 className="text-2xl font-semibold mb-2">No Events Yet!</h2>
            <p className="text-muted-foreground mb-4">This timeline is empty. {isOwner ? "Add some events to get started." : ""}</p>
            {isOwner && <Button onClick={handleAddEventClick} className="neo-button">Add First Event</Button>}
          </div>
        ) : (
          <div className={eventListContainerClasses}>
            <div className="flex flex-col gap-8 sm:gap-12 md:flex-row md:overflow-x-auto md:pb-8">
              {events.map((event, index) => (
                <div key={event.id} className="relative md:min-w-[350px] lg:min-w-[400px] flex-shrink-0">
                  {/* Dot on timeline (optional, if line is central) */}
                  {/* <div className="hidden md:block absolute top-1/2 left-[-6px] -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background"></div> */}
                  {/* <div className="block md:hidden absolute left-[-22px] top-4 w-3 h-3 bg-primary rounded-full border-2 border-background"></div> */}
                  <EventCard
                    event={event}
                    previousEventDueDate={index > 0 ? events[index - 1].dueDate : null}
                    isNextUpcoming={event.id === nextUpcomingEventId}
                    onEdit={isOwner ? handleEditEvent : ()=>{}}
                    onDelete={isOwner ? handleDeleteEvent : ()=>{}}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {isOwner && (
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

