
"use client";

import type { Timeline } from '@/types';
import VisibilityToggle from './VisibilityToggle';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/button';
import { PlusCircle, Lock, Unlock } from 'lucide-react'; // Added Lock, Unlock

interface HeaderBarProps {
  timeline: Timeline;
  onAddEventClick: () => void;
}

export default function HeaderBar({ timeline, onAddEventClick }: HeaderBarProps) {
  const { user } = useAuth();
  const isOwner = user?.uid === timeline.userId;

  return (
    <div className="sticky top-16 z-40 bg-background/90 backdrop-blur-md shadow-md border-b-2 border-black py-3">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary truncate" title={timeline.title}>
          {timeline.title}
        </h1>
        <div className="flex items-center gap-3">
          {isOwner && (
            <>
              <VisibilityToggle timelineId={timeline.id} initialIsPublic={timeline.isPublic} />
              <Button onClick={onAddEventClick} className="neo-button">
                <PlusCircle className="h-5 w-5 mr-2" /> Add Event
              </Button>
            </>
          )}
          {!isOwner && (
            <span className="text-sm font-semibold neo-card bg-card border-foreground border-2 px-3 py-1.5 rounded-md flex items-center gap-1">
              {timeline.isPublic ? <Unlock className="inline h-4 w-4" /> : <Lock className="inline h-4 w-4" />}
              {timeline.isPublic ? 'Public Timeline' : 'Private Timeline'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
