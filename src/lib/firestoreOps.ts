import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Timeline, TimelineEvent, UserProfile } from '@/types';

// Helper to convert Firestore Timestamps to Date objects or ISO strings in fetched data
const processDoc = <T>(docSnap: any): T => {
  const data = docSnap.data() as any;
  if (!data) return data;
  const processedData = { id: docSnap.id, ...data };
  for (const key in processedData) {
    if (processedData[key] instanceof Timestamp) {
      processedData[key] = processedData[key].toDate(); // Or .toDate().toISOString()
    }
  }
  return processedData as T;
};

const processTimelineEvent = (docSnap: any): TimelineEvent => {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      ...data,
      dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : new Date(data.dueDate),
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as TimelineEvent;
};

const processTimeline = (docSnap: any): Timeline => {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as Timeline;
}


// Timelines
export const createTimeline = async (userId: string, username: string, title: string): Promise<string> => {
  const timelinesColRef = collection(db, 'timelines');
  const newTimelineRef = await addDoc(timelinesColRef, {
    userId,
    username,
    title,
    isPublic: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newTimelineRef.id;
};

export const getUserTimelines = async (userId: string): Promise<Timeline[]> => {
  const timelinesColRef = collection(db, 'timelines');
  const q = query(timelinesColRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => processTimeline(doc));
};

export const getTimelineById = async (timelineId: string): Promise<Timeline | null> => {
  const timelineDocRef = doc(db, 'timelines', timelineId);
  const docSnap = await getDoc(timelineDocRef);
  return docSnap.exists() ? processTimeline(docSnap) : null;
};

export const getTimelineByUsernameAndId = async (username: string, timelineId: string): Promise<Timeline | null> => {
  // In a real app, you might query based on a slug or have a more direct way to get this.
  // For now, we assume timelineId is unique and fetch by it, then verify username.
  // Or, if timelineId is truly a "slug" field under a user:
  // const q = query(collection(db, 'timelines'), where('username', '==', username), where('slug', '==', timelineId));
  // const snapshot = await getDocs(q);
  // if (snapshot.empty) return null;
  // return processTimeline(snapshot.docs[0]);
  
  // Simplified: fetch by ID and check username.
  const timeline = await getTimelineById(timelineId);
  if (timeline && timeline.username === username) {
    return timeline;
  }
  return null;
};

export const updateTimelineVisibility = async (timelineId: string, isPublic: boolean): Promise<void> => {
  const timelineDocRef = doc(db, 'timelines', timelineId);
  await updateDoc(timelineDocRef, {
    isPublic,
    updatedAt: serverTimestamp(),
  });
};

// Events
export const addEventToTimeline = async (timelineId: string, eventData: Omit<TimelineEvent, 'id' | 'timelineId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const eventsColRef = collection(db, 'timelines', timelineId, 'events');
  // Convert JS Date back to Firestore Timestamp for storage if needed by serverTimestamp()
  // Here, dueDate is expected to be a Date object from client
  const newEventRef = await addDoc(eventsColRef, {
    ...eventData,
    dueDate: Timestamp.fromDate(new Date(eventData.dueDate)), // Ensure it's a Firestore Timestamp
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newEventRef.id;
};

export const getTimelineEvents = async (timelineId: string): Promise<TimelineEvent[]> => {
  const eventsColRef = collection(db, 'timelines', timelineId, 'events');
  const q = query(eventsColRef, orderBy('dueDate', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => processTimelineEvent(doc));
};

export const updateTimelineEvent = async (timelineId: string, eventId: string, eventData: Partial<TimelineEvent>): Promise<void> => {
  const eventDocRef = doc(db, 'timelines', timelineId, 'events', eventId);
  const updatePayload: any = { ...eventData, updatedAt: serverTimestamp() };
  if (eventData.dueDate) {
    updatePayload.dueDate = Timestamp.fromDate(new Date(eventData.dueDate));
  }
  await updateDoc(eventDocRef, updatePayload);
};

export const deleteTimelineEvent = async (timelineId: string, eventId: string): Promise<void> => {
  const eventDocRef = doc(db, 'timelines', timelineId, 'events', eventId);
  await deleteDoc(eventDocRef);
};

// User profile (mainly for username check during signup)
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  return processDoc<UserProfile>(querySnapshot.docs[0]);
};

// Function to get all events data for a user for AI suggestions
export const getAllUserEventsForAI = async (userId: string): Promise<string> => {
  const userTimelines = await getUserTimelines(userId);
  let allEventsString = "";

  for (const timeline of userTimelines) {
    const events = await getTimelineEvents(timeline.id);
    events.forEach(event => {
      allEventsString += `Timeline: ${timeline.title}, Event: ${event.title}, Description: ${event.description}, Due: ${ (event.dueDate as unknown as Date).toISOString().split('T')[0]};\n`;
    });
  }
  return allEventsString.trim() || "No past event data available.";
};
