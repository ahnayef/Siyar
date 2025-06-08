import React from 'react'
import TimelineCard from '@/components/dashboard/TimelineCard'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Clock, Database } from 'lucide-react'
import type { Timeline } from '@/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TimelinesProps {
  data: Timeline[];
  username: string;
  error?: boolean;
}

export default function Timelines({ 
  data, 
  username,
  error = false
}: TimelinesProps) {
  if (!data) {
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
            {username}'s Public Timelines
          </h1>
        </div>
        <div className="text-center py-12 neo-card">
          <Database className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-foreground">Unable to Load Timelines</h2>
          <p className="text-muted-foreground mb-4 text-body-md">
            We encountered an error while trying to load the timelines. This might be due to missing database indexes.
          </p>
          <Button asChild className="neo-button mt-4">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
          {username}'s Public Timelines
        </h1>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 neo-card">
          <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-foreground">No Public Timelines</h2>
          <p className="text-muted-foreground mb-4 text-body-md">
            {username} hasn't published any public timelines yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((timeline) => (
            <TimelineCard 
              key={timeline.id} 
              timeline={timeline} 
              isReadOnly={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
