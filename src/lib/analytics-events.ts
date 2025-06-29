"use client";

import posthog from 'posthog-js';

// Timeline events
export const trackTimelineEvent = {
  created: (timelineId: string, title: string) => {
    posthog.capture('timeline_created', { timelineId, title });
  },
  
  viewed: (timelineId: string, title: string, owner: string) => {
    posthog.capture('timeline_viewed', { timelineId, title, owner });
  },
  
  renamed: (timelineId: string, oldTitle: string, newTitle: string) => {
    posthog.capture('timeline_renamed', { timelineId, oldTitle, newTitle });
  },
  
  trashed: (timelineId: string, title: string) => {
    posthog.capture('timeline_moved_to_trash', { timelineId, title });
  },
  
  restored: (timelineId: string, title: string) => {
    posthog.capture('timeline_restored', { timelineId, title });
  },
  
  shared: (timelineId: string, title: string, sharingMethod: string) => {
    posthog.capture('timeline_shared', { timelineId, title, sharingMethod });
  },
};

// Timeline event items (within a timeline)
export const trackEventItem = {
  added: (timelineId: string, eventId: string, eventTitle: string) => {
    posthog.capture('event_added', { timelineId, eventId, eventTitle });
  },
  
  edited: (timelineId: string, eventId: string, eventTitle: string) => {
    posthog.capture('event_edited', { timelineId, eventId, eventTitle });
  },
  
  deleted: (timelineId: string, eventId: string, eventTitle: string) => {
    posthog.capture('event_deleted', { timelineId, eventId, eventTitle });
  },
};

// User journey/funnel tracking
export const trackFunnel = {
  // Timeline creation funnel
  timelineCreation: {
    started: () => posthog.capture('funnel_timeline_creation_started'),
    namedTimeline: (title: string) => posthog.capture('funnel_timeline_creation_named', { title }),
    addedFirstEvent: (timelineId: string) => posthog.capture('funnel_timeline_creation_first_event', { timelineId }),
    completed: (timelineId: string, eventsCount: number) => posthog.capture('funnel_timeline_creation_completed', { 
      timelineId, 
      eventsCount,
      duration: 'completed' // Calculate time since started if tracking start time
    }),
  },
  
  // Signup funnel
  signup: {
    viewed: () => posthog.capture('funnel_signup_viewed'),
    started: () => posthog.capture('funnel_signup_started'),
    completed: (method: string) => posthog.capture('funnel_signup_completed', { method }),
  },
};

export default {
  trackTimelineEvent,
  trackEventItem,
  trackFunnel
};
