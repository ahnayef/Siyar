import React from 'react'
import type { Metadata } from 'next';
import TimelineViewPage from './ViewTimeline';
import { getTimelineByUsernameAndId } from '@/lib/firestoreOps';

export async function generateMetadata({
     params,
}: {
     params: { username: string; timelineId: string };
}): Promise<Metadata> {
     const { username, timelineId } = params;

     // Fetch timeline data for dynamic metadata
     let title = 'Siyar Timeline';
     let description = 'A timeline by ' + username;

     try {
          // For metadata generation, we only check public timelines
          // No user ID is passed as this runs server-side without authentication context
          const timeline = await getTimelineByUsernameAndId(username, timelineId);
          if (timeline) {
               if (timeline.isPublic && !timeline.deleted && !timeline.isInTrash) {
                    title = ` ${timeline.title} | Siyar`;
                    description = `View ${timeline.title}, a timeline by ${username} on Siyar`;
               } else {
                    title = `Private Timeline | Siyar`;
                    description = `This timeline is private. Please log in to view it.`;
               }
          }
     } catch (error) {
          console.error('Error fetching timeline for metadata:', error);
     }

     return {
          title: title,
          description: description,
          openGraph: {
               title: title,
               url: `/${username}/${timelineId}`,
               siteName: 'Siyar',
               images: [
                    {
                         url: `/Siyar.png`,
                         width: 1200,
                         height: 630,
                         alt: `${title} - Siyar Timeline`
                    },
               ],
          },
     }
}

export default async function TimelinesPage({
     params,
}: {
     params: { username: string; timelineId: string };
}) {
     // No need to fetch anything here as the client component will handle it
     return <TimelineViewPage />
}