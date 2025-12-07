


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
  deleted?: boolean;  // For backward compatibility, will eventually be removed
  isInTrash?: boolean; // New property name for clarity
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
