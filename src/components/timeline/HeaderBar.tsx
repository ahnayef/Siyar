
"use client";

import type { Timeline } from '@/types';
import VisibilityToggle from './VisibilityToggle';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/button';
import { PlusCircle, Lock, Unlock, Users, Share2 } from 'lucide-react';
import ShareTimelineModal from '../dashboard/ShareTimelineModal'; 
import { useState } from 'react';

interface HeaderBarProps {
  timeline: Timeline;
  onAddEventClick: () => void;
}

export default function HeaderBar({ timeline, onAddEventClick }: HeaderBarProps) {
  const { user } = useAuth();
  const isOwner = user?.uid === timeline.userId;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/${timeline.username}/${timeline.id}` : '';


  return (
    <>
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md shadow-sm border-b-2 border-strong-border-color py-3">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col items-start flex-grow min-w-0">
              <h1 className="text-2xl sm:text-3xl font-archivo font-extrabold text-foreground truncate" title={timeline.title}>
              {timeline.title}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center font-inter">
                  <Users className="h-3 w-3 mr-1" /> By {timeline.username}
              </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {isOwner && (
              <>
                <Button onClick={() => setIsShareModalOpen(true)} variant="outline" className="neo-button-outline">
                  <Share2 className="h-4 w-4 mr-2"/> Share
                </Button>
                <VisibilityToggle timelineId={timeline.id} initialIsPublic={timeline.isPublic} />
                <Button onClick={onAddEventClick} className="neo-button">
                  <PlusCircle className="h-5 w-5 mr-2" /> Add Event
                </Button>
              </>
            )}
            {!isOwner && (
              <>
                <Button onClick={() => setIsShareModalOpen(true)} variant="outline" className="neo-button-outline">
                  <Share2 className="h-4 w-4 mr-2"/> Share
                </Button>
                <span className="text-sm font-semibold neo-button-outline px-3 py-1.5 flex items-center gap-1.5">
                  {timeline.isPublic ? <Unlock className="inline h-4 w-4 text-accent" /> : <Lock className="inline h-4 w-4 text-muted-foreground" />}
                  {timeline.isPublic ? 'Public' : 'Private'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <ShareTimelineModal 
            isOpen={isShareModalOpen} 
            setIsOpen={setIsShareModalOpen} 
            timelineTitle={timeline.title}
            shareUrl={shareLink}
        />
    </>
  );
}
    
