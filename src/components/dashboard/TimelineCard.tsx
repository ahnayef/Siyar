"use client";

import type { Timeline } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Lock, Unlock, CalendarDays, ArrowRight, MoreVertical, Trash2, Share2, Copy, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { deleteTimelineAction, restoreTimelineAction } from '@/actions/timelineActions'; 
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import ShareTimelineModal from './ShareTimelineModal'; 
import { logAnalyticsEvent } from '@/lib/analytics';

interface TimelineCardProps {
  timeline: Timeline;
  onTimelineDeleted?: (timelineId: string) => void;
  onTimelineRestored?: (timelineId: string) => void;
  isReadOnly?: boolean;
}

export default function TimelineCard({ timeline, onTimelineDeleted, onTimelineRestored, isReadOnly = false }: TimelineCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwner = !isReadOnly && user?.uid === timeline.userId;
  const isInTrash = timeline.isInTrash === true || timeline.deleted === true;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    try {
      await deleteTimelineAction(user.uid, timeline.id);
      toast({ title: "Moved to Trash", description: `"${timeline.title}" has been moved to trash.` });
      logAnalyticsEvent('trash_timeline', { timeline_id: timeline.id, user_id: user.uid });
      if (onTimelineDeleted) {
        onTimelineDeleted(timeline.id);
      }
    } catch (error: any) {
      toast({ title: "Error Moving Timeline to Trash", description: error.message, variant: "destructive" });
    }
  };

  const handleRestore = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    try {
      await restoreTimelineAction(user.uid, timeline.id);
      toast({ title: "Restored from Trash", description: `"${timeline.title}" has been restored from trash.` });
      logAnalyticsEvent('restore_timeline', { timeline_id: timeline.id, user_id: user.uid });
      if (onTimelineRestored) {
        onTimelineRestored(timeline.id);
      }
    } catch (error: any) {
      toast({ title: "Error Restoring Timeline", description: error.message, variant: "destructive" });
    }
  };

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
    logAnalyticsEvent('open_share_timeline_modal', { timeline_id: timeline.id, user_id: user?.uid });
  }

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/${timeline.username}/${timeline.id}` : '';


  return (
    <>
      <Card className={`neo-card flex flex-col h-full p-1 hover:shadow-neo-hover active:shadow-neo-active transition-shadow ${isInTrash ? 'bg-muted/50 border-dashed' : ''}`}>
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex justify-between items-start mb-1">
            <div>
              {isInTrash && (
                <Badge variant="outline" className="mb-2 text-yellow-600 border-yellow-600">In Trash</Badge>
              )}
              <CardTitle className={`text-xl font-archivo leading-tight ${isInTrash ? 'text-muted-foreground line-through' : 'text-primary hover:text-primary/80'}`}>
                {isInTrash ? (
                  timeline.title
                ) : (
                  <Link href={`/${timeline.username}/${timeline.id}`}>
                    {timeline.title}
                  </Link>
                )}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
                {timeline.isPublic ? 
                    <Unlock className="h-4 w-4 text-accent shrink-0" /> : 
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
                {isOwner && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-5 w-5" />
                            <span className="sr-only">Timeline options</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="neo-card w-48">
                            {isInTrash ? (
                                <DropdownMenuItem onClick={handleRestore} className="cursor-pointer text-yellow-600 focus:bg-yellow-50 focus:text-yellow-700">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Restore from Trash
                                </DropdownMenuItem>
                            ) : (
                                <>
                                    <DropdownMenuItem onClick={handleOpenShareModal} className="cursor-pointer">
                                        <Share2 className="mr-2 h-4 w-4" /> Share
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                                        </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="neo-card">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-archivo">Move to Trash?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-body-md">
                                            This will move the timeline "{timeline.title}" to your trash.
                                            You can restore it later if needed.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="neo-button-outline">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="neo-button-destructive">
                                            Move to Trash
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
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
          {isInTrash ? (
            <Button 
              onClick={handleRestore}
              className="neo-button w-full text-sm py-2 bg-yellow-500 hover:bg-yellow-600"
            >
              Restore from Trash <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="neo-button w-full text-sm py-2">
              <Link href={`/${timeline.username}/${timeline.id}`}>
                View Timeline <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
      {isOwner && !isInTrash && (
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
