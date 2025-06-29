
"use client";

import type { Timeline } from '@/types';
import VisibilityToggle from './VisibilityToggle';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/button';
import { PlusCircle, Users, Share2, Pencil } from 'lucide-react';
import ShareTimelineModal from '../dashboard/ShareTimelineModal'; 
import RenameTimelineModal from '../dashboard/RenameTimelineModal';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HeaderBarProps {
  timeline: Timeline;
  onAddEventClick: () => void;
  onTimelineRenamed?: (newTitle: string) => void;
}

export default function HeaderBar({ timeline, onAddEventClick, onTimelineRenamed }: HeaderBarProps) {
  const { user } = useAuth();
  const isOwner = user?.uid === timeline.userId;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [timelineTitle, setTimelineTitle] = useState(timeline.title);
  
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/${timeline.username}/${timeline.id}` : '';

  const handleRenamed = (newTitle: string) => {
    setTimelineTitle(newTitle);
    if (onTimelineRenamed) {
      onTimelineRenamed(newTitle);
    }
  };

  // Add scroll event listener to minimize header further when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      <div className={cn(
        "sticky top-16 z-40 bg-background/95 backdrop-blur-md shadow-sm border-b-2 border-strong-border-color transition-all duration-300",
        isScrolled ? "py-1" : "py-2 sm:py-3"
      )}>
        <div className="container mx-auto px-4">
          {/* Collapsed view - always visible */}
          <div className="flex justify-between items-center">
            {/* Title and username always visible */}
            <div className="flex-1 min-w-0 pr-2">
              <h1 className={cn(
                "font-archivo font-extrabold text-foreground truncate transition-all", 
                isScrolled ? "text-lg sm:text-xl" : "text-xl sm:text-2xl md:text-3xl"
              )} title={timelineTitle}>
                {timelineTitle}
              </h1>
              <div className="flex items-center text-xs text-muted-foreground font-inter">
                <Users className="h-3 w-3 mr-1" /> {timeline.username}
              </div>
            </div>
            
            {/* Icon-only buttons */}
            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <Button 
                    onClick={onAddEventClick} 
                    size="icon" 
                    className="neo-button h-8 w-8"
                    title="Add Event"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={() => setIsShareModalOpen(true)} 
                    variant="outline" 
                    size="icon" 
                    className="neo-button-outline h-8 w-8"
                    title="Share Timeline"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={() => setIsRenameModalOpen(true)} 
                    variant="outline" 
                    size="icon" 
                    className="neo-button-outline h-8 w-8"
                    title="Rename Timeline"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <VisibilityToggle 
                    timelineId={timeline.id} 
                    initialIsPublic={timeline.isPublic} 
                    className="h-8 w-8 p-0"
                    iconOnly
                  />
                </>
              )}
              
              {!isOwner && (
                <>
                  <Button 
                    onClick={() => setIsShareModalOpen(true)} 
                    variant="outline" 
                    size="icon" 
                    className="neo-button-outline h-8 w-8"
                    title="Share Timeline"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Remove the toggle expand/collapse button */}
            </div>
          </div>
        </div>
      </div>
      <ShareTimelineModal 
        isOpen={isShareModalOpen} 
        setIsOpen={setIsShareModalOpen} 
        timelineTitle={timelineTitle}
        shareUrl={shareLink}
      />
      {isOwner && (
        <RenameTimelineModal 
          isOpen={isRenameModalOpen} 
          setIsOpen={setIsRenameModalOpen} 
          timelineId={timeline.id}
          currentTitle={timelineTitle}
          onRenamed={handleRenamed}
        />
      )}
    </>
  );
}
    
