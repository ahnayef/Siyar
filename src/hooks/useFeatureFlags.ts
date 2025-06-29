"use client";

import { useState, useEffect } from 'react';
import posthog from 'posthog-js';

/**
 * Custom hook to work with PostHog feature flags
 * @param {string} flagKey - The feature flag key to check
 * @param {boolean} defaultValue - Default value if flag is not defined
 * @returns {boolean} - Whether the feature is enabled
 */
export function useFeatureFlag(flagKey: string, defaultValue = false): boolean {
  const [enabled, setEnabled] = useState<boolean>(defaultValue);
  
  useEffect(() => {
    // Check if flag is defined when component mounts
    const checkFlag = () => {
      const isEnabled = posthog.isFeatureEnabled(flagKey);
      setEnabled(isEnabled ?? defaultValue);
    };
    
    // Check immediately
    checkFlag();
    
    // Recheck whenever the active feature flags might have changed
    const handleFlagsReloaded = () => {
      setTimeout(checkFlag, 50); // Short delay to ensure flags are processed
    };
    
    // Listen for feature flags loaded
    document.addEventListener('posthog:featureFlags', handleFlagsReloaded);
    
    return () => {
      document.removeEventListener('posthog:featureFlags', handleFlagsReloaded);
    };
  }, [flagKey, defaultValue]);
  
  return enabled;
}

/**
 * Higher-level hook for common Siyar feature flags
 */
export function useSiyarFeatures() {
  const enhancedEvents = useFeatureFlag('enhanced-events', false);
  const timelineCollaboration = useFeatureFlag('timeline-collaboration', false);
  const advancedAnalytics = useFeatureFlag('advanced-analytics', false);
  const aiSuggestions = useFeatureFlag('ai-suggestions', false);
  
  return {
    enhancedEvents,
    timelineCollaboration,
    advancedAnalytics,
    aiSuggestions
  };
}
