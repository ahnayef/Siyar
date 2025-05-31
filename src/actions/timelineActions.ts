
"use server";

import { auth, db } from "@/lib/firebase";
import { getUserTimelines, createTimeline, updateTimelineVisibility, addEventToTimeline, getTimelineEvents, updateTimelineEvent, deleteTimelineEvent, getAllUserEventsForAI as getAllUserEventsForAIDbOp } from "@/lib/firestoreOps";
import type { Timeline, TimelineEvent } from "@/types";
import { Timestamp, collection, doc, serverTimestamp, getDocs, query, where, updateDoc, getDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function createTimelineAction(userId: string, username: string, title: string): Promise<string> {
  if (!userId || !username) {
    throw new Error("User ID and username are required.");
  }
  const timelineId = await createTimeline(userId, username, title);
  revalidatePath("/dashboard");
  return timelineId;
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
  await updateTimelineVisibility(timelineId, isPublic);
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

  const newEventData = {
    title: eventData.title,
    description: eventData.description || "",
    dueDate: Timestamp.fromDate(new Date(eventData.dueDate)),
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };
  
  const newEventRef = doc(collection(db, 'timelines', timelineId, 'events'));
  await newEventRef.set(newEventData);

  const username = timelineDocSnap.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
  
  return { 
    id: newEventRef.id, 
    timelineId, 
    ...eventData, 
    dueDate: newEventData.dueDate, 
    createdAt: Timestamp.now(), 
    updatedAt: Timestamp.now() 
  } as TimelineEvent;
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
    dueDate: Timestamp.fromDate(new Date(eventData.dueDate)),
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
  } as TimelineEvent;
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
  await deleteTimelineEvent(timelineId, eventId);
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
