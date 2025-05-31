
"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, collection, query, where, writeBatch } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function updateUserUsernameAction(userId: string, newUsername: string): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  if (!newUsername || newUsername.length < 3) {
    throw new Error("New username must be at least 3 characters long.");
  }

  const newUsernameLower = newUsername.toLowerCase();

  // Check if the new username is already taken by someone else
  const usernameDocRef = doc(db, "usernames", newUsernameLower);
  const usernameDocSnap = await getDoc(usernameDocRef);
  if (usernameDocSnap.exists() && usernameDocSnap.data()?.userId !== userId) {
    throw new Error("Username already taken. Please choose another one.");
  }

  const userDocRef = doc(db, "users", userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    throw new Error("User document not found.");
  }

  const oldUsername = userDocSnap.data()?.username;
  const oldUsernameLower = oldUsername?.toLowerCase();

  const batch = writeBatch(db);

  // Update the username in the user's document
  batch.update(userDocRef, { username: newUsername });

  // If the new username is different and not already taken by this user (case change)
  // or if it's a completely new username:
  // 1. Delete the old username document (if it exists and is different)
  // 2. Create the new username document
  if (oldUsernameLower && oldUsernameLower !== newUsernameLower) {
    const oldUsernameDocRef = doc(db, "usernames", oldUsernameLower);
    batch.delete(oldUsernameDocRef);
  }
  
  // Create/update the new username entry if it's new or if it wasn't pointing to this user
  if (!usernameDocSnap.exists() || usernameDocSnap.data()?.userId !== userId) {
     batch.set(usernameDocRef, { userId: userId });
  }


  // Update username in all timelines created by this user
  const timelinesQuery = query(collection(db, "timelines"), where("userId", "==", userId));
  const timelinesSnapshot = await getDocs(timelinesQuery);
  timelinesSnapshot.forEach(timelineDoc => {
    batch.update(timelineDoc.ref, { username: newUsername });
  });

  await batch.commit();

  revalidatePath("/profile");
  revalidatePath("/dashboard"); // Revalidate dashboard in case timeline cards show username
  // Revalidate individual timeline pages if username is part of the URL or displayed content
  timelinesSnapshot.forEach(timelineDoc => {
    revalidatePath(`/${newUsername}/${timelineDoc.id}`);
    if (oldUsername) { // Also revalidate old paths if username changed
      revalidatePath(`/${oldUsername}/${timelineDoc.id}`);
    }
  });
}
