
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, writeBatch, getDocs } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateUsernameSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  newUsername: z.string().min(3, "New username must be at least 3 characters long.").max(20, "Username cannot exceed 20 characters.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
});

export async function updateUserUsernameAction(userId: string, newUsername: string): Promise<void> {
  const validationResult = UpdateUsernameSchema.safeParse({ userId, newUsername });
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors.map(e => e.message).join(", "));
  }

  const newUsernameLower = newUsername.toLowerCase();

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

  batch.update(userDocRef, { username: newUsername });

  if (oldUsernameLower && oldUsernameLower !== newUsernameLower) {
    const oldUsernameDocRef = doc(db, "usernames", oldUsernameLower);
    batch.delete(oldUsernameDocRef);
  }
  
  if (!usernameDocSnap.exists() || usernameDocSnap.data()?.userId !== userId) {
     batch.set(usernameDocRef, { userId: userId });
  }

  // Update username in timelines
  const timelinesQuery = query(collection(db, "timelines"), where("userId", "==", userId));
  const timelinesSnapshot = await getDocs(timelinesQuery);
  timelinesSnapshot.forEach(timelineDoc => {
    batch.update(timelineDoc.ref, { 
      username: newUsername
      // Removed updatedAt: serverTimestamp() from here as per request to undo security rule related changes
    });
  });

  await batch.commit();

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  timelinesSnapshot.forEach(timelineDoc => {
    revalidatePath(`/${newUsername}/${timelineDoc.id}`);
    if (oldUsername) {
      revalidatePath(`/${oldUsername}/${timelineDoc.id}`);
    }
  });
}
