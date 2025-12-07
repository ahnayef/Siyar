"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserTimelines } from '@/lib/firestoreOps';
import TimelineCard from '@/components/dashboard/TimelineCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import type { Timeline } from '@/types';
import { logAnalyticsEvent } from '@/lib/analytics';

export default function TrashPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const loadTrashTimelines = async () => {
      setIsLoading(true);
      try {
        // Only get timelines that are in trash
        const userTimelines = await getUserTimelines(user.uid, true);
        const trashedTimelines = userTimelines.filter(timeline => timeline.isInTrash || timeline.deleted);
        setTimelines(trashedTimelines);
        logAnalyticsEvent('view_trash', { user_id: user.uid });
      } catch (error: any) {
        console.error('Error loading trash timelines:', error);
        toast({
          title: "Error",
          description: "Failed to load trash. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTrashTimelines();
  }, [user, authLoading, router, toast, searchParams]); // Added searchParams to dependencies

  const handleTimelineRestored = (timelineId: string) => {
    setTimelines(prev => prev.filter(t => t.id !== timelineId));
  };

  if (authLoading || (isLoading && user)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-1/3 bg-muted/30" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[4px] bg-muted/20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Trash Bin</h1>
          <p className="text-muted-foreground">Items in the trash will be permanently deleted after 30 days</p>
        </div>
        <Button variant="outline" asChild className="neo-button-outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      {timelines.length === 0 ? (
        <div className="text-center py-12 neo-card">
          <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-foreground">Trash is Empty</h2>
          <p className="text-muted-foreground mb-4 text-body-md">
            You don&apos;t have any timelines in the trash.
          </p>
          <Button asChild className="neo-button mt-4">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timelines.map((timeline) => (
            <TimelineCard 
              key={timeline.id} 
              timeline={timeline} 
              onTimelineRestored={handleTimelineRestored}
              isReadOnly={false} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
