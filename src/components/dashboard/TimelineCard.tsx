
"use client";

import type { Timeline } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, CalendarDays, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineCardProps {
  timeline: Timeline;
}

export default function TimelineCard({ timeline }: TimelineCardProps) {
  return (
    <Card className="neo-card rounded-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary hover:underline">
          <Link href={`/${timeline.username}/${timeline.id}`}>
            {timeline.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center text-muted-foreground">
          {timeline.isPublic ? <Unlock className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
          {timeline.isPublic ? 'Public' : 'Private'}
          <span className="mx-2">·</span>
          <CalendarDays className="h-4 w-4 mr-1" />
          Created {timeline.createdAt ? format(timeline.createdAt, 'MMM d, yyyy') : 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild className="neo-button w-full">
          <Link href={`/${timeline.username}/${timeline.id}`}>
            <Eye className="mr-2 h-4 w-4" /> View Timeline
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
