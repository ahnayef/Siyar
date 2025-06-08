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
  Timestamp as FirebaseTimestamp, 
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Timeline, TimelineEvent, UserProfile } from '@/types';

const processDoc = <T extends { id: string }>(docSnap: any): T => {
  const data = docSnap.data() as any;
  if (!data) return { id: docSnap.id, ...data } as T; 
  const processedData: any = { id: docSnap.id, ...data };
  for (const key in processedData) {
    if (processedData[key] instanceof FirebaseTimestamp) {
      processedData[key] = processedData[key].toDate();
    }
  }
  return processedData as T;
};

const processTimelineEvent = (docSnap: any): TimelineEvent => {
  const data = docSnap.data() as any;
  return {
    id: docSnap.id,
    ...data,
    dueDate: data.dueDate instanceof FirebaseTimestamp ? data.dueDate.toDate() : new Date(data.dueDate),
    createdAt: data.createdAt instanceof FirebaseTimestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof FirebaseTimestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  } as TimelineEvent; 
};

const processTimeline = (docSnap: any): Timeline => {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof FirebaseTimestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof FirebaseTimestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as Timeline; 
}


// Timelines
export const createTimeline = async (userId: string, username: string, title: string): Promise<Timeline> => {
  const timelinesColRef = collection(db, 'timelines');
  const newTimelineData = {
    userId,
    username,
    title,
    isPublic: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const newTimelineRef = await addDoc(timelinesColRef, newTimelineData);
  
  const newTimelineSnap = await getDoc(newTimelineRef);
  if (!newTimelineSnap.exists()) {
    throw new Error("Failed to create timeline: document not found after creation.");
  }
  return processTimeline(newTimelineSnap);
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

export const deleteTimeline = async (timelineId: string): Promise<void> => {
  // Delete all events in the timeline first (batched delete)
  const eventsColRef = collection(db, 'timelines', timelineId, 'events');
  const eventsSnapshot = await getDocs(eventsColRef);
  const batch = writeBatch(db);
  eventsSnapshot.docs.forEach(eventDoc => {
    batch.delete(eventDoc.ref);
  });
  await batch.commit();

  // Then delete the timeline document itself
  const timelineDocRef = doc(db, 'timelines', timelineId);
  await deleteDoc(timelineDocRef);
};


// Events
export const addEventToTimeline = async (timelineId: string, eventData: Omit<TimelineEvent, 'id' | 'timelineId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const eventsColRef = collection(db, 'timelines', timelineId, 'events');
  const newEventRef = await addDoc(eventsColRef, {
    ...eventData,
    dueDate: FirebaseTimestamp.fromDate(eventData.dueDate), 
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

export const updateTimelineEvent = async (timelineId: string, eventId: string, eventData: Partial<Omit<TimelineEvent, 'id' | 'timelineId' | 'createdAt' | 'updatedAt'>> & { dueDate?: Date }): Promise<void> => {
  const eventDocRef = doc(db, 'timelines', timelineId, 'events', eventId);
  const updatePayload: any = { ...eventData, updatedAt: serverTimestamp() };
  if (eventData.dueDate) {
    updatePayload.dueDate = FirebaseTimestamp.fromDate(eventData.dueDate); 
  }
  await updateDoc(eventDocRef, updatePayload);
};

export const deleteTimelineEvent = async (timelineId: string, eventId: string): Promise<void> => {
  const eventDocRef = doc(db, 'timelines', timelineId, 'events', eventId);
  await deleteDoc(eventDocRef);
};

// User profile
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const userDoc = querySnapshot.docs[0];
  const data = userDoc.data();
  return {
      uid: userDoc.id, 
      email: data.email,
      username: data.username,
      createdAt: data.createdAt instanceof FirebaseTimestamp ? data.createdAt.toDate() : new Date(data.createdAt)
  } as UserProfile;
};

// Public timelines
export const getPublicTimelinesByUsername = async (username: string): Promise<Timeline[]> => {
  try {
    const timelinesColRef = collection(db, 'timelines');
    // This query requires a composite index, which should be created in the Firebase console
    const q = query(
      timelinesColRef, 
      where('username', '==', username), 
      where('isPublic', '==', true), 
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => processTimeline(doc));
  } catch (error: any) {
    // If we get an index error, try a simpler query and filter in memory
    if (error.message && error.message.includes("requires an index")) {
      console.warn("Composite index missing, using fallback query method");
      
      const timelinesColRef = collection(db, 'timelines');
      const simpleQ = query(timelinesColRef, where('username', '==', username));
      const snapshot = await getDocs(simpleQ);
      
      // Filter and sort in memory
      const timelines = snapshot.docs
        .map(doc => processTimeline(doc))
        .filter(timeline => timeline.isPublic)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return timelines;
    }
    throw error; // If it's not an index error, rethrow
  }
};
