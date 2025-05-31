
import type { Timestamp as FirebaseTimestamp } from 'firebase/firestore'; // Keep for server-side if needed, but client types use Date

export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  createdAt: Date; // Was FirebaseTimestamp, now JS Date after processing
}

export interface Timeline {
  id: string;
  userId: string;
  username: string;
  title: string;
  isPublic: boolean;
  createdAt: Date; // Was FirebaseTimestamp
  updatedAt: Date; // Was FirebaseTimestamp
  events?: TimelineEvent[]; 
}

export interface TimelineEvent {
  id: string;
  timelineId: string;
  title: string;
  description: string;
  dueDate: Date; // Was FirebaseTimestamp
  createdAt: Date; // Was FirebaseTimestamp
  updatedAt: Date; // Was FirebaseTimestamp
}
