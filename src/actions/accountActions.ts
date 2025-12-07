"use server";

import { db } from "@/lib/firebase";
import { doc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";

/**
 * Deletes all user data from Firestore including:
 * - User document
 * - Username mapping
 * - All timelines owned by the user
 */
export async function deleteUserDataAction(userId: string, username: string) {
  try {
    // Delete all timelines owned by the user
    const timelinesRef = collection(db, "timelines");
    const timelinesQuery = query(timelinesRef, where("ownerId", "==", userId));
    const timelinesSnapshot = await getDocs(timelinesQuery);
    
    const deletePromises = [];
    
    // Delete each timeline
    for (const timelineDoc of timelinesSnapshot.docs) {
      deletePromises.push(deleteDoc(doc(db, "timelines", timelineDoc.id)));
    }
    
    // Delete username mapping
    deletePromises.push(deleteDoc(doc(db, "usernames", username.toLowerCase())));
    
    // Delete user document
    deletePromises.push(deleteDoc(doc(db, "users", userId)));
    
    // Execute all deletions
    await Promise.all(deletePromises);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user data:", error);
    throw new Error(error.message || "Failed to delete user data");
  }
}
