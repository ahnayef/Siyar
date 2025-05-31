
"use server";

import { db } from "@/lib/firebase";
import { createTimeline as createTimelineDbOp, updateTimelineVisibility as updateTimelineVisibilityDbOp, getTimelineEvents, getAllUserEventsForAI as getAllUserEventsForAIDbOp, deleteTimelineEvent as deleteTimelineEventDbOp } from "@/lib/firestoreOps";
import type { Timeline, TimelineEvent } from "@/types"; // Import Timeline type
import { Timestamp, collection, doc, serverTimestamp, getDocs, query, where, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function createTimelineAction(userId: string, username: string, title: string): Promise<Timeline> { // Return Timeline
  if (!userId || !username) {
    throw new Error("User ID and username are required.");
  }
  const newTimeline = await createTimelineDbOp(userId, username, title); // createTimelineDbOp now returns Timeline
  revalidatePath("/dashboard");
  return newTimeline; // Return the full new timeline object
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
  eventData: { title: string; description?: string; dueDate: Date } // eventData.dueDate is JS Date
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
    dueDate: Timestamp.fromDate(eventData.dueDate), // Convert JS Date to Firestore Timestamp for saving
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const newEventRef = doc(collection(db, 'timelines', timelineId, 'events'));
  await setDoc(newEventRef, newEventFirestoreData);

  const username = timelineDocSnap.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
  
  // For the returned object, use JS Dates as per updated TimelineEvent type
  // Fetch the event to get server-resolved timestamps
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
  eventData: { title: string; description?: string; dueDate: Date } // eventData.dueDate is JS Date
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
    dueDate: Timestamp.fromDate(eventData.dueDate), // Convert JS Date to Firestore Timestamp for saving
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

  // Convert Firestore Timestamps from fetched doc to JS Dates for return
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

export async function getAllUserEventsForAIAction(userId: string): Promise<string> {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  return getAllUserEventsForAIDbOp(userId);
}
