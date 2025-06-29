"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostHogUserIdentifier from '@/components/analytics/PostHogUserIdentifier';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: '/ingest',
        ui_host: 'https://us.posthog.com',
        capture_pageview: 'history_change',
        capture_exceptions: true,
        autocapture: true, // Track clicks, form submissions, etc.
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        },
        debug: process.env.NODE_ENV === 'development',
      });
      
      // Enable session recording
      if (posthog.startSessionRecording) {
        posthog.startSessionRecording();
      }
    }
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PostHogUserIdentifier />
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}