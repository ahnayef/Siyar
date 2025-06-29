"use client";

import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

// ===== EVENT TRACKING =====
// Core analytics events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, properties);
};

// Timeline specific events
export const trackTimelineEvent = {
  created: (timelineId: string, title: string) => 
    trackEvent('timeline_created', { timelineId, title }),
  
  viewed: (timelineId: string, title: string, owner: string) => 
    trackEvent('timeline_viewed', { timelineId, title, owner }),
  
  renamed: (timelineId: string, oldTitle: string, newTitle: string) => 
    trackEvent('timeline_renamed', { timelineId, oldTitle, newTitle }),
  
  trashed: (timelineId: string, title: string) => 
    trackEvent('timeline_trashed', { timelineId, title }),
  
  restored: (timelineId: string, title: string) => 
    trackEvent('timeline_restored', { timelineId, title }),
  
  shared: (timelineId: string, title: string, sharingMethod: string) => 
    trackEvent('timeline_shared', { timelineId, title, sharingMethod }),
};

// Event specific analytics
export const trackTimelineEventItem = {
  added: (timelineId: string, eventId: string, eventTitle: string) => 
    trackEvent('event_added', { timelineId, eventId, eventTitle }),
  
  edited: (timelineId: string, eventId: string, eventTitle: string) => 
    trackEvent('event_edited', { timelineId, eventId, eventTitle }),
  
  deleted: (timelineId: string, eventId: string, eventTitle: string) => 
    trackEvent('event_deleted', { timelineId, eventId, eventTitle }),
};

// User action events
export const trackUserAction = {
  login: (method: string) => trackEvent('user_login', { method }),
  signup: (method: string) => trackEvent('user_signup', { method }),
  logout: () => trackEvent('user_logout'),
  profileUpdate: () => trackEvent('profile_updated'),
};

// ===== USER IDENTIFICATION =====
export const useIdentifyUser = () => {
  const { user, userProfile } = useAuth();
  
  useEffect(() => {
    if (user) {
      // Identify the user to connect all events to their profile
      posthog.identify(user.uid, {
        email: user.email,
        name: user.displayName,
        username: userProfile?.username,
        created_at: user.metadata.creationTime,
      });
    } else {
      // Reset identification if user logs out
      posthog.reset();
    }
  }, [user, userProfile]);
};

// ===== FEATURE FLAGS =====
// Check if a feature flag is enabled for current user
export const isFeatureEnabled = (flagKey: string, defaultValue: boolean = false): boolean => {
  return posthog.isFeatureEnabled(flagKey, { send_event: true }) ?? defaultValue;
};

// Special check for flags that should be available with fallbacks
export const useFeatureFlag = (flagKey: string, defaultValue: boolean = false): boolean => {
  const [enabled, setEnabled] = useState(defaultValue);
  
  useEffect(() => {
    const checkFlag = () => {
      const isEnabled = posthog.isFeatureEnabled(flagKey, { send_event: true });
      setEnabled(isEnabled ?? defaultValue);
    };
    
    checkFlag();
    
    // Setup event listener for feature flag changes
    const handleFlagsLoaded = () => {
      setTimeout(checkFlag, 100); // Short delay to ensure flags are processed
    };
    
    // Listen for feature flags loaded
    document.addEventListener('posthog:featureFlags', handleFlagsLoaded);
    
    return () => {
      document.removeEventListener('posthog:featureFlags', handleFlagsLoaded);
    };
  }, [flagKey, defaultValue]);
  
  return enabled;
};

// ===== FUNNELS & CONVERSION TRACKING =====
// Track important conversion steps
export const trackFunnelStep = (funnelName: string, stepName: string, properties?: Record<string, any>) => {
  trackEvent(`funnel_${funnelName}_${stepName}`, { 
    funnel: funnelName,
    step: stepName,
    ...properties
  });
};

// Predefined funnels
export const funnels = {
  signup: {
    started: () => trackFunnelStep('signup', 'started'),
    completed: () => trackFunnelStep('signup', 'completed'),
  },
  timelineCreation: {
    started: () => trackFunnelStep('timeline_creation', 'started'),
    titled: (title: string) => trackFunnelStep('timeline_creation', 'titled', { title }),
    firstEventAdded: () => trackFunnelStep('timeline_creation', 'first_event_added'),
    completed: () => trackFunnelStep('timeline_creation', 'completed'),
  }
};

// ===== SUPER PROPERTIES =====
// Set persistent properties that will be sent with every event
export const setUserProperties = (properties: Record<string, any>) => {
  posthog.register(properties);
};

// ===== PAGE VIEWS =====
// PostHog captures these automatically with the history_change setting
// But this can be used for manual page view tracking if needed
export const trackPageView = (url: string, referrer?: string) => {
  posthog.capture('$pageview', { 
    $current_url: url,
    $referrer: referrer
  });
};

// ===== GROUP ANALYTICS =====
// If you implement team or organization features in the future
export const setGroup = (groupType: string, groupKey: string, groupProperties?: Record<string, any>) => {
  posthog.group(groupType, groupKey, groupProperties);
};

// Export everything for easy imports
export default {
  trackEvent,
  trackTimelineEvent,
  trackTimelineEventItem,
  trackUserAction,
  useIdentifyUser,
  isFeatureEnabled,
  useFeatureFlag,
  trackFunnelStep,
  funnels,
  setUserProperties,
  trackPageView,
  setGroup,
  // Direct access to posthog instance for advanced usage
  posthog
};
