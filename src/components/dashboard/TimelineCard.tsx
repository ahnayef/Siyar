
"use client";

import type { Timeline } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Lock, Unlock, CalendarDays, ArrowRight, MoreVertical, Trash2, Share2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { deleteTimelineAction } from '@/actions/timelineActions'; 
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import ShareTimelineModal from './ShareTimelineModal'; 
import { logAnalyticsEvent } from '@/lib/analytics';

interface TimelineCardProps {
  timeline: Timeline;
  onTimelineDeleted?: (timelineId: string) => void;
}

export default function TimelineCard({ timeline, onTimelineDeleted }: TimelineCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwner = user?.uid === timeline.userId;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    try {
      await deleteTimelineAction(user.uid, timeline.id);
      toast({ title: "Timeline Deleted", description: `"${timeline.title}" has been removed.` });
      logAnalyticsEvent('delete_timeline', { timeline_id: timeline.id, user_id: user.uid });
      if (onTimelineDeleted) {
        onTimelineDeleted(timeline.id);
      }
    } catch (error: any) {
      toast({ title: "Error Deleting Timeline", description: error.message, variant: "destructive" });
    }
  };

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
    logAnalyticsEvent('open_share_timeline_modal', { timeline_id: timeline.id, user_id: user?.uid });
  }

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/${timeline.username}/${timeline.id}` : '';


  return (
    <>
      <Card className="neo-card flex flex-col h-full p-1 hover:shadow-neo-hover active:shadow-neo-active transition-shadow">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-xl font-archivo text-primary hover:text-primary/80 leading-tight">
              <Link href={`/${timeline.username}/${timeline.id}`}>
                {timeline.title}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-2">
                {timeline.isPublic ? 
                    <Unlock className="h-4 w-4 text-accent shrink-0" title="Public" /> : 
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" title="Private" />}
                {isOwner && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-5 w-5" />
                            <span className="sr-only">Timeline options</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="neo-card w-48">
                            <DropdownMenuItem onClick={handleOpenShareModal} className="cursor-pointer">
                                <Share2 className="mr-2 h-4 w-4" /> Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="neo-card">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-archivo">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-body-md">
                                    This action cannot be undone. This will permanently delete the timeline
                                    "{timeline.title}" and all its events.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="neo-button-outline">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="neo-button-destructive">
                                    Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

          </div>
          <CardDescription className="flex items-center text-muted-foreground text-xs font-space-mono">
            <CalendarDays className="h-3 w-3 mr-1.5" />
            Created: {timeline.createdAt ? format(timeline.createdAt, 'MMM d, yyyy') : 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto pt-4 pb-5 px-5">
          <Button asChild className="neo-button w-full text-sm py-2">
            <Link href={`/${timeline.username}/${timeline.id}`}>
              View Timeline <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      {isOwner && (
        <ShareTimelineModal 
            isOpen={isShareModalOpen} 
            setIsOpen={setIsShareModalOpen} 
            timelineTitle={timeline.title}
            shareUrl={shareLink}
        />
      )}
    </>
  );
}
