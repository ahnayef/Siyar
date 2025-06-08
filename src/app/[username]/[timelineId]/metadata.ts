import { Metadata } from 'next';
import { getTimelineByUsernameAndId } from '@/lib/firestoreOps';

type Props = {
  params: {
    username: string;
    timelineId: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, timelineId } = params;
  
  // Default metadata in case of errors or loading
  let metadata: Metadata = {
    title: 'Timeline | Siyar',
    description: 'View this timeline on Siyar',
    openGraph: {
      images: ['/Siyar.png'],
    },
  };

  try {
    // Only proceed if we have both username and timelineId
    if (username && timelineId) {
      const timeline = await getTimelineByUsernameAndId(username, timelineId);
      
      if (timeline) {
        metadata = {
          title: `${timeline.title} | Siyar`,
          openGraph: {
            title: timeline.title,
            images: ['/Siyar.png'],
          },
        };
      }
    }
  } catch (error) {
    console.error('Error generating timeline metadata:', error);
    // Use default metadata in case of error
  }

  return metadata;
}
