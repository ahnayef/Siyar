import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  createdAt: Timestamp;
}

export interface Timeline {
  id: string;
  userId: string;
  username: string;
  title: string;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  events?: TimelineEvent[]; // Optional: sometimes fetched together
}

export interface TimelineEvent {
  id: string;
  timelineId: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
