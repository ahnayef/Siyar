
"use server";

import { db } from "@/lib/firebase";
import { createTimeline as createTimelineDbOp, deleteTimeline as deleteTimelineDbOp, updateTimelineVisibility as updateTimelineVisibilityDbOp, getTimelineEvents, deleteTimelineEvent as deleteTimelineEventDbOp } from "@/lib/firestoreOps";
import type { Timeline, TimelineEvent } from "@/types"; 
import { Timestamp, collection, doc, serverTimestamp, getDocs, query, where, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateTimelineSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  title: z.string().min(1, "Title is required.").max(100, "Title cannot exceed 100 characters."),
});

const EventDataSchema = z.object({
  title: z.string().min(1, "Event title is required.").max(100, "Event title cannot exceed 100 characters."),
  description: z.string().max(500, "Event description cannot exceed 500 characters.").optional().default(""),
  dueDate: z.date({ required_error: "Due date is required." }),
});

export async function createTimelineAction(userId: string, username: string, title: string): Promise<Timeline> { 
  const validationResult = CreateTimelineSchema.safeParse({ userId, username, title });
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors.map(e => e.message).join(", "));
  }
  // User ID and username validation is primarily for existence, actual authorization is by ownership.
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
    revalidatePath(`/${username}/${timelineId}`);
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
  eventDataInput: { title: string; description?: string; dueDate: Date } 
): Promise<TimelineEvent> {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  const timelineDocRef = doc(db, "timelines", timelineId);
  const timelineDocSnap = await getDoc(timelineDocRef);

  if (!timelineDocSnap.exists() || timelineDocSnap.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }

  const validationResult = EventDataSchema.safeParse(eventDataInput);
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors.map(e => e.message).join(", "));
  }
  const eventData = validationResult.data;

  const newEventFirestoreData = {
    title: eventData.title,
    description: eventData.description, // Already defaulted by Zod if undefined
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
  eventDataInput: { title: string; description?: string; dueDate: Date } 
): Promise<TimelineEvent> {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  const timelineDocRef = doc(db, "timelines", timelineId);
  const timelineDocSnap = await getDoc(timelineDocRef);

  if (!timelineDocSnap.exists() || timelineDocSnap.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }

  const validationResult = EventDataSchema.safeParse(eventDataInput);
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors.map(e => e.message).join(", "));
  }
  const eventData = validationResult.data;

  const eventDocRef = doc(db, 'timelines', timelineId, 'events', eventId);
  // Ensure the event exists before attempting to update
  const eventSnap = await getDoc(eventDocRef);
  if (!eventSnap.exists()) {
    throw new Error("Event not found.");
  }

  const updatePayload: any = { 
    title: eventData.title,
    description: eventData.description, // Already defaulted by Zod if undefined
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
    createdAt: (updatedEventData.createdAt as Timestamp).toDate(), // createdAt should not change on update
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
  
  // Ensure the event exists before attempting to delete
  const eventDocRef = doc(db, 'timelines', timelineId, 'events', eventId);
  const eventSnap = await getDoc(eventDocRef);
  if (!eventSnap.exists()) {
    // Optional: depending on desired behavior, could throw error or silently succeed
    // For now, let's be explicit if the event doesn't exist.
    throw new Error("Event not found or already deleted.");
  }

  await deleteTimelineEventDbOp(timelineId, eventId);
  const username = timelineDocSnap.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
}
