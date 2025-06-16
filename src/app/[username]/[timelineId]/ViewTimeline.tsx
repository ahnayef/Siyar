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
import { AlertTriangle, CalendarPlus, Smile, CalendarClock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteTimelineEventAction } from '@/actions/timelineActions';
import { cn } from '@/lib/utils';
import { formatDistanceStrict, isValid } from 'date-fns';
import { logAnalyticsEvent } from '@/lib/analytics';


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
      setError("Invalid URL parameters: username or timelineId is missing.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setTimeline(null); 
      setEvents([]); 

      try {
        console.log(`Fetching data for user: ${username}, timeline: ${timelineId}`);
        console.log("Current authUser state:", authUser);
        console.log("Auth loading state:", authLoading);

        const fetchedOwnerProfile = await getUserByUsername(username);
        if (!fetchedOwnerProfile) {
            setError(`Timeline owner profile ('${username}') not found.`);
            setIsLoading(false);
            return;
        }
        setOwnerProfile(fetchedOwnerProfile);

        const timelineData = await getTimelineByUsernameAndId(username, timelineId);

        if (!timelineData) {
          setError(`Timeline not found with ID '${timelineId}' for user '${username}', or URL is incorrect. Please check the link.`);
          setIsLoading(false);
          return;
        }
        
        console.log("Fetched timelineData:", timelineData);
        console.log("Auth User UID for check:", authUser?.uid);
        console.log("Timeline User ID for check:", timelineData?.userId);
        console.log("Is timeline public:", timelineData?.isPublic);

        if (!timelineData.isPublic) {
          if (!authUser) {
            setError("This timeline is private. Please log in to view if you are the owner.");
            setIsLoading(false);
            return;
          }
          if (authUser.uid !== timelineData.userId) {
            setError("This timeline is private and you are not authorized to view it. Access denied.");
            setIsLoading(false);
            return;
          }
        }
        
        setTimeline(timelineData);
        logAnalyticsEvent('view_timeline', { timeline_id: timelineId, user_id: authUser?.uid, owner_username: username });

        const eventData = await getTimelineEvents(timelineId);
        setEvents(eventData.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));

      } catch (err: any) {
        console.error("Error fetching timeline data in TimelineViewPage:", err);
        setError(err.message || "Failed to load timeline. This could be due to network issues or access restrictions.");
        if (toast && (err.message.includes("Access denied") || err.message.includes("permission"))) { 
          toast({ title: "Access Error", description: "You might not have permission to view this timeline or its events.", variant: "destructive" });
        } else if (toast) {
          toast({ title: "Error", description: err.message || "Failed to load timeline.", variant: "destructive" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) { 
        fetchData();
    } else {
      console.log("Auth is still loading, delaying fetchData...");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, timelineId, authUser, authLoading]); 

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
        logAnalyticsEvent('delete_event', { timeline_id: timeline.id, event_id: eventId, user_id: authUser.uid });
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
  
  const nextUpcomingEventId = useMemo(() => {
    const now = new Date();
    const upcoming = events
      .filter(event => event.dueDate.getTime() > now.getTime())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); 
    return upcoming.length > 0 ? upcoming[0].id : null;
  }, [events]);

  useEffect(() => {
    if (nextUpcomingEventId && events.length > 0) {
      const element = document.getElementById(`event-${nextUpcomingEventId}`);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100); 
        return () => clearTimeout(timer); 
      }
    }
  }, [nextUpcomingEventId, events]);


  if (authLoading || (isLoading && !error && !timeline && !params.username && !params.timelineId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4 bg-muted/50 rounded-[4px]" />
        <Skeleton className="h-8 w-1/4 mb-8 bg-muted/50 rounded-[4px]" /> 
        <div className="space-y-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start">
              <div className="flex flex-col items-center mr-6 mt-1">
                <Skeleton className="w-8 h-8 bg-primary/30 rounded-[4px]" /> 
                <Skeleton className="w-1.5 h-24 mt-2 bg-strong-border-color/30 rounded-[4px]" /> 
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
          <h2 className="text-3xl font-bold mb-2 text-destructive">Access Issue</h2>
          <p className="text-muted-foreground mb-6 text-body-md">{error}</p>
          <Button onClick={() => router.push('/dashboard')} className="neo-button">Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!timeline) { 
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="neo-card p-8">
          <Smile className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-muted-foreground">Timeline Loading...</h2>
          <p className="text-muted-foreground mb-6 text-body-md">Just a moment, fetching the details. If this persists, the timeline might not exist or there could be an issue.</p>
           <Button onClick={() => router.push('/dashboard')} className="neo-button">Go to Dashboard</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background min-h-screen">
      <HeaderBar timeline={timeline} onAddEventClick={handleAddEventClick} />
      <div className="container mx-auto px-4 py-8">
        {events.length === 0 && timeline ? ( 
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
            {events.map((event, index) => {
              let gapIndicatorText = null;
              if (index > 0) {
                const prevEventDueDate = events[index-1].dueDate;
                const currentEventDueDate = event.dueDate;
                if (isValid(currentEventDueDate) && isValid(prevEventDueDate) && currentEventDueDate.getTime() > prevEventDueDate.getTime()) { 
                   gapIndicatorText = formatDistanceStrict(currentEventDueDate, prevEventDueDate, { roundingMethod: 'round' });
                }
              }

              return (
                <React.Fragment key={event.id}>
                  {gapIndicatorText && (
                     <div className="relative h-16 flex items-center justify-center my-2">
                       <div className="bg-card border-2 border-strong-border-color shadow-neo-active p-2 rounded-[4px] text-xs font-space-mono text-muted-foreground flex items-center gap-1.5 z-10">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {gapIndicatorText} later
                      </div>
                    </div>
                  )}
                  <div className="h-full flex items-start mb-12 relative" id={`event-${event.id}`}>
                    <div className="absolute left-[-20px] top-1 flex flex-col items-center h-full"> 
                       <div className={cn(`
                        w-6 h-6 border-2 flex-shrink-0 z-10 rounded-sm
                        shadow-neo-active`,
                        event.id === nextUpcomingEventId 
                          ? 'border-primary bg-primary animate-pulse' 
                          : 'border-strong-border-color bg-card' 
                      )}></div>
                      {index < events.length - 1 && ( 
                        <div className={cn(
                            "w-1 flex-grow bg-strong-border-color h-full",
                        )}></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 ml-4"> 
                      <EventCard
                        event={event}
                        isNextUpcoming={event.id === nextUpcomingEventId}
                        onEdit={isOwner ? handleEditEvent : undefined}
                        onDelete={isOwner ? handleDeleteEvent : undefined}
                        isOwner={isOwner}
                      />
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
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

