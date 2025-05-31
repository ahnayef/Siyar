"use server";

import { auth, db } from "@/lib/firebase";
import { getUserTimelines, createTimeline, updateTimelineVisibility, addEventToTimeline, getTimelineEvents, updateTimelineEvent, deleteTimelineEvent, getAllUserEventsForAI as getAllUserEventsForAIDbOp } from "@/lib/firestoreOps";
import type { Timeline, TimelineEvent } from "@/types";
import { Timestamp, collection, doc, serverTimestamp, writeBatch, getDocs, query, where } from "firebase/firestore";
import { revalidatePath } from "next/cache";

// Helper to get current authenticated user's ID and username
async function getAuthenticatedUser() {
  const firebaseUser = auth.currentUser; // This works for client-side calls proxied via server actions if auth state is maintained.
                                          // For true server-side auth, you'd need to handle session/token verification.
                                          // Assuming this action is called from client where auth state is available via useAuth.
                                          // For robust server actions, pass userId/username explicitly after server-side verification.
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error("User not authenticated.");
  }
  // This is a simplified way to get username. In a real app, you might have it from a session or re-fetch.
  // For this example, we assume client passes enough info or we fetch it based on UID.
  const userDoc = await doc(db, "users", firebaseUser.uid).get();
  if (!userDoc.exists()) throw new Error("User profile not found.");
  const username = userDoc.data()?.username;
  if (!username) throw new Error("Username not found for user.");
  
  return { userId: firebaseUser.uid, username };
}


export async function createTimelineAction(title: string): Promise<string> {
  const { userId, username } = await getAuthenticatedUser();
  const timelineId = await createTimeline(userId, username, title);
  revalidatePath("/dashboard");
  return timelineId;
}

export async function updateTimelineVisibilityAction(timelineId: string, isPublic: boolean): Promise<void> {
  const { userId } = await getAuthenticatedUser();
  // Add a check to ensure the user owns the timeline before updating
  const timelineDoc = await doc(db, "timelines", timelineId).get();
  if (!timelineDoc.exists() || timelineDoc.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }
  await updateTimelineVisibility(timelineId, isPublic);
  const username = timelineDoc.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
  revalidatePath("/dashboard");
}


export async function addEventToTimelineAction(
  timelineId: string, 
  eventData: { title: string; description?: string; dueDate: Date }
): Promise<TimelineEvent> {
  const { userId } = await getAuthenticatedUser();
  const timelineDoc = await doc(db, "timelines", timelineId).get();
  if (!timelineDoc.exists() || timelineDoc.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }

  const eventsColRef = collection(db, 'timelines', timelineId, 'events');
  const newEventData = {
    title: eventData.title,
    description: eventData.description || "",
    dueDate: Timestamp.fromDate(new Date(eventData.dueDate)),
    createdAt: serverTimestamp() as Timestamp, // Cast for type consistency
    updatedAt: serverTimestamp() as Timestamp, // Cast for type consistency
  };
  
  const newEventRef = await doc(collection(db, 'timelines', timelineId, 'events')); // Generate ID client-side like
  await newEventRef.set(newEventData);

  const username = timelineDoc.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
  
  // Return the full event object as expected by client
  return { 
    id: newEventRef.id, 
    timelineId, 
    ...eventData, 
    dueDate: newEventData.dueDate, 
    createdAt: Timestamp.now(), // Approximate, serverTimestamp is better
    updatedAt: Timestamp.now() 
  } as TimelineEvent;
}

export async function updateTimelineEventAction(
  timelineId: string, 
  eventId: string, 
  eventData: { title: string; description?: string; dueDate: Date }
): Promise<TimelineEvent> {
  const { userId } = await getAuthenticatedUser();
  const timelineDoc = await doc(db, "timelines", timelineId).get();
  if (!timelineDoc.exists() || timelineDoc.data()?.userId !== userId) {
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

  const username = timelineDoc.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
  
  const updatedEventSnap = await getDoc(eventDocRef);
  const updatedEventData = updatedEventSnap.data();

  return { 
    id: eventId, 
    timelineId, 
    ...updatedEventData,
    dueDate: (updatedEventData?.dueDate as Timestamp).toDate(),
    createdAt: (updatedEventData?.createdAt as Timestamp).toDate(),
    updatedAt: (updatedEventData?.updatedAt as Timestamp).toDate(),
  } as TimelineEvent;
}

export async function deleteTimelineEventAction(timelineId: string, eventId: string): Promise<void> {
  const { userId } = await getAuthenticatedUser();
  const timelineDoc = await doc(db, "timelines", timelineId).get();
  if (!timelineDoc.exists() || timelineDoc.data()?.userId !== userId) {
    throw new Error("Unauthorized or timeline not found.");
  }
  await deleteTimelineEvent(timelineId, eventId);
  const username = timelineDoc.data()?.username;
  if (username) {
    revalidatePath(`/${username}/${timelineId}`);
  }
}

export async function getAllUserEventsForAIAction(): Promise<string> {
  const { userId } = await getAuthenticatedUser();
  return getAllUserEventsForAIDbOp(userId);
}

// This is a server action. In a real app, ensure auth is handled correctly.
// For now, assuming client provides necessary IDs after its own auth checks.
// Actual production server actions would need more robust auth.
