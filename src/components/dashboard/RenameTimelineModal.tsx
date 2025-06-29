"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { renameTimelineAction } from '@/actions/timelineActions';
import { logAnalyticsEvent } from '@/lib/analytics';

interface RenameTimelineModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  timelineId: string;
  currentTitle: string;
  onRenamed?: (newTitle: string) => void;
}

export default function RenameTimelineModal({ 
  isOpen, 
  setIsOpen, 
  timelineId, 
  currentTitle,
  onRenamed 
}: RenameTimelineModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setIsSubmitting(false);
    }
  }, [isOpen, currentTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to rename a timeline.", variant: "destructive" });
      return;
    }
    
    if (!title.trim()) {
      toast({ title: "Error", description: "Timeline title cannot be empty.", variant: "destructive" });
      return;
    }
    
    if (title.trim() === currentTitle) {
      setIsOpen(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await renameTimelineAction(user.uid, timelineId, title.trim());
      toast({ title: "Timeline Renamed", description: `Timeline has been renamed to "${title.trim()}".` });
      logAnalyticsEvent('rename_timeline', { timeline_id: timelineId, user_id: user.uid });
      
      if (onRenamed) {
        onRenamed(title.trim());
      }
      
      setIsOpen(false);
    } catch (error: any) {
      toast({ 
        title: "Failed to Rename Timeline", 
        description: error.message || "An unexpected error occurred.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="neo-card sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-archivo">Rename Timeline</DialogTitle>
            <DialogDescription>
              Enter a new name for your timeline.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter timeline title"
                maxLength={100}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)} 
              className="neo-button-outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="neo-button" 
              disabled={isSubmitting || !title.trim() || title.trim() === currentTitle}
            >
              {isSubmitting ? "Renaming..." : "Rename Timeline"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
