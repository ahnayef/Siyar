import React from 'react'
import Timelines from './Timelines';

export default async function TimelinesPage({
     params,
}: {
     params: Promise<{ username: string }>;
}) {
     const { username } = await params;

     // Fetch timeline

     return (
          <Timelines data={timelineData} />
     )
}