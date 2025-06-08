import React from 'react'
import Timelines from './Timelines';
import { getPublicTimelinesByUsername, getUserByUsername } from '@/lib/firestoreOps';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
     params,
}: {
     params: { username: string };
}): Promise<Metadata> {
     const { username } = params;
     
     // Get the user profile to ensure the user exists
     const userProfile = await getUserByUsername(username);
     
     if (!userProfile) {
          return {
               title: 'User Not Found',
               description: 'The requested user profile could not be found',
          };
     }

     return {
          title: `${username}'s Timelines`,
          description: `View public timelines for ${username}`,
          openGraph: {
               title: `${username}'s Timelines`,
               description: `View public timelines for ${username}`,
               url: `/u/${username}`,
               siteName: 'Siyar',
               images: [
                    {
                         url: `/Siyar.png`,
                         width: 1200,
                         height: 630,
                         alt: `${username}'s Timelines`,
                    },
               ],
          },
     }
}

export default async function TimelinesPage({
     params,
}: {
     params: { username: string };
}) {
     const { username } = params;
     
     try {
          // Get the user profile to ensure the user exists
          const userProfile = await getUserByUsername(username);
          
          if (!userProfile) {
               notFound();
          }
          
          // Fetch public timelines for this user
          const publicTimelines = await getPublicTimelinesByUsername(username);

          return (
               <Timelines data={publicTimelines} username={username} />
          )
     } catch (error) {
          console.error("Error fetching public timelines:", error);
          // Still show the page but with empty data
          return (
               <Timelines data={[]} username={username} error={true} />
          )
     }
}