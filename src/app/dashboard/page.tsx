
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import TimelineCard from '@/components/dashboard/TimelineCard';
import CreateTimelineModal from '@/components/dashboard/CreateTimelineModal';
import type { Timeline } from '@/types';
import { getUserTimelines } from '@/lib/firestoreOps';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';

function DashboardContent() {
  const { user, userProfile } = useAuth();
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserTimelines(user.uid)
        .then(fetchedTimelines => {
          setTimelines(fetchedTimelines);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleTimelineCreated = (newTimeline: Timeline) => {
    setTimelines(prevTimelines => [newTimeline, ...prevTimelines]);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-1/3 bg-muted/30" />
          <Skeleton className="h-10 w-40 bg-muted/30" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-lg bg-muted/20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Your Timelines</h1>
        {userProfile && <CreateTimelineModal onTimelineCreated={handleTimelineCreated} />}
      </div>

      {timelines.length === 0 ? (
        <div className="text-center py-12 neo-card">
          <PlusCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-foreground">No Timelines Yet!</h2>
          <p className="text-muted-foreground mb-4">Get started by creating your first timeline.</p>
          {userProfile && <CreateTimelineModal onTimelineCreated={handleTimelineCreated} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timelines.map((timeline) => (
            <TimelineCard key={timeline.id} timeline={timeline} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
