"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import posthog from 'posthog-js';

export default function PostHogUserIdentifier() {
  const { user, userProfile } = useAuth();
  
  // Identify user for analytics
  useEffect(() => {
    if (user && user.uid) {
      // Set user identity for posthog
      posthog.identify(user.uid, {
        email: user.email,
        name: user.displayName,
        username: userProfile?.username,
        created_at: user.metadata.creationTime,
      });
      
      // You can also use these properties for segmentation in PostHog
      posthog.people.set({
        $name: userProfile?.username || user.displayName,
        $email: user.email,
        user_id: user.uid,
        account_created: user.metadata.creationTime,
      });
    } else {
      // If no user, reset identification
      posthog.reset();
    }
  }, [user, userProfile]);
  
  // This is just an invisible component for identification purposes
  return null;
}
