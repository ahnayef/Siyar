
"use client";

import type { Timeline } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, CalendarDays, Eye, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineCardProps {
  timeline: Timeline;
}

export default function TimelineCard({ timeline }: TimelineCardProps) {
  return (
    <Card className="neo-card rounded-lg overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold text-primary hover:underline leading-tight">
            <Link href={`/${timeline.username}/${timeline.id}`}>
                {timeline.title}
            </Link>
            </CardTitle>
            {timeline.isPublic ? <Unlock className="h-5 w-5 text-accent shrink-0" /> : <Lock className="h-5 w-5 text-muted-foreground shrink-0" />}
        </div>
        <CardDescription className="flex items-center text-muted-foreground text-xs pt-1">
          <CalendarDays className="h-4 w-4 mr-1.5" />
          Created: {timeline.createdAt ? format(timeline.createdAt, 'MMM d, yyyy') : 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto pt-4"> {/* Pushes footer to bottom */}
        <Button asChild className="neo-button w-full">
          <Link href={`/${timeline.username}/${timeline.id}`}>
            View Timeline <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
