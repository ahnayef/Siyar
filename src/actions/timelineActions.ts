
"use server";

import { db } from "@/lib/firebase";
import { createTimeline as createTimelineDbOp, deleteTimeline as deleteTimelineDbOp, updateTimelineVisibility as updateTimelineVisibilityDbOp, getTimelineEvents, deleteTimelineEvent as deleteTimelineEventDbOp } from "@/lib/firestoreOps"; // Removed getAllUserEventsForAIDbOp
import type { Timeline, TimelineEvent } from "@/types"; 
import { Timestamp, collection, doc, serverTimestamp, getDocs, query, where, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function createTimelineAction(userId: string, username: string, title: string): Promise<Timeline> { 
  if (!userId || !username) {
    throw new Error("User ID and username are required.");
  }
  const newTimeline = await createTimelineDbOp(userId, username, title); 
  revalidatePath("/dashboard");
  return newTimeline; 
}

export async function deleteTimelineAction(userId: string, timelineId: string): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  const timelineDocRef = doc(db, "timelines", timelineId);
  const timelineDocSnap = await getDoc(timelineDocRef);

  if (!timelineDocSnap.exists() || timelineDocSnap.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }
  await deleteTimelineDbOp(timelineId);
  revalidatePath("/dashboard");
  const username = timelineDocSnap.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`); // Also revalidate individual timeline page
  }
}


export async function updateTimelineVisibilityAction(userId: string, timelineId: string, isPublic: boolean): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  const timelineDocRef = doc(db, "timelines", timelineId);
  const timelineDocSnap = await getDoc(timelineDocRef);

  if (!timelineDocSnap.exists() || timelineDocSnap.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }
  await updateTimelineVisibilityDbOp(timelineId, isPublic);
  const username = timelineDocSnap.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
  revalidatePath("/dashboard");
}

export async function addEventToTimelineAction(
  userId: string,
  timelineId: string, 
  eventData: { title: string; description?: string; dueDate: Date } 
): Promise<TimelineEvent> {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  const timelineDocRef = doc(db, "timelines", timelineId);
  const timelineDocSnap = await getDoc(timelineDocRef);

  if (!timelineDocSnap.exists() || timelineDocSnap.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }

  const newEventFirestoreData = {
    title: eventData.title,
    description: eventData.description || "",
    dueDate: Timestamp.fromDate(eventData.dueDate), 
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const newEventRef = doc(collection(db, 'timelines', timelineId, 'events'));
  await setDoc(newEventRef, newEventFirestoreData);

  const username = timelineDocSnap.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
  
  const newEventSnap = await getDoc(newEventRef);
  const newEventSavedData = newEventSnap.data();

  if (!newEventSavedData) {
    throw new Error("Failed to retrieve newly created event data.");
  }

  return { 
    id: newEventRef.id, 
    timelineId, 
    title: newEventSavedData.title,
    description: newEventSavedData.description,
    dueDate: (newEventSavedData.dueDate as Timestamp).toDate(),
    createdAt: (newEventSavedData.createdAt as Timestamp).toDate(),
    updatedAt: (newEventSavedData.updatedAt as Timestamp).toDate(),
  };
}

export async function updateTimelineEventAction(
  userId: string,
  timelineId: string, 
  eventId: string, 
  eventData: { title: string; description?: string; dueDate: Date } 
): Promise<TimelineEvent> {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  const timelineDocRef = doc(db, "timelines", timelineId);
  const timelineDocSnap = await getDoc(timelineDocRef);

  if (!timelineDocSnap.exists() || timelineDocSnap.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }

  const eventDocRef = doc(db, 'timelines', timelineId, 'events', eventId);
  const updatePayload: any = { 
    title: eventData.title,
    description: eventData.description || "",
    dueDate: Timestamp.fromDate(eventData.dueDate), 
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(eventDocRef, updatePayload);

  const username = timelineDocSnap.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
  
  const updatedEventSnap = await getDoc(eventDocRef);
  const updatedEventData = updatedEventSnap.data();

  if (!updatedEventData) {
    throw new Error("Failed to retrieve updated event data.");
  }

  return { 
    id: eventId, 
    timelineId, 
    title: updatedEventData.title,
    description: updatedEventData.description,
    dueDate: (updatedEventData.dueDate as Timestamp).toDate(),
    createdAt: (updatedEventData.createdAt as Timestamp).toDate(),
    updatedAt: (updatedEventData.updatedAt as Timestamp).toDate(),
  };
}

export async function deleteTimelineEventAction(userId: string, timelineId: string, eventId: string): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  const timelineDocRef = doc(db, "timelines", timelineId);
  const timelineDocSnap = await getDoc(timelineDocRef);

  if (!timelineDocSnap.exists() || timelineDocSnap.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }
  await deleteTimelineEventDbOp(timelineId, eventId);
  const username = timelineDocSnap.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
}

// Removed getAllUserEventsForAIAction
