
"use client";

import type { Timeline } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, CalendarDays, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineCardProps {
  timeline: Timeline;
}

export default function TimelineCard({ timeline }: TimelineCardProps) {
  return (
    <Card className="neo-card flex flex-col h-full p-1 hover:shadow-neo-hover active:shadow-neo-active transition-shadow">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-xl font-archivo text-foreground hover:text-primary leading-tight">
            <Link href={`/${timeline.username}/${timeline.id}`}>
                {timeline.title}
            </Link>
            </CardTitle>
            {timeline.isPublic ? 
                <Unlock className="h-4 w-4 text-accent shrink-0" /> : 
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
        </div>
        <CardDescription className="flex items-center text-muted-foreground text-xs font-space-mono">
          <CalendarDays className="h-3 w-3 mr-1.5" />
          Created: {timeline.createdAt ? format(timeline.createdAt, 'MMM d, yyyy') : 'N/A'}
        </CardDescription>
      </CardHeader>
      {/* Add upcoming event preview here if desired, as per guide */}
      <CardFooter className="mt-auto pt-4 pb-5 px-5">
        <Button asChild className="neo-button w-full text-sm py-2">
          <Link href={`/${timeline.username}/${timeline.id}`}>
            View Timeline <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
    