
"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { revalidatePath } from "next/cache";

function ProfilePageContent() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username);
    }
  }, [userProfile]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }
    if (username === userProfile.username) {
      toast({ title: "No Changes", description: "Username is the same.", variant: "default" });
      return;
    }
    if (username.length < 3) {
      toast({ title: "Validation Error", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }

    setIsSavingUsername(true);
    try {
      // Note: Username uniqueness should ideally be checked server-side via a callable function
      // For simplicity, we're only updating the user's document here.
      // A real app would need to manage a "usernames" collection for uniqueness.
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { username: username });
      
      // Re-fetch or update userProfile context if it's not automatically updated
      // For now, we assume a page refresh or re-auth might be needed for navbar update, or AuthContext handles it.
      toast({ title: "Username Updated!", description: `Your username is now ${username}.` });
      // Potentially update userProfile in context or trigger a re-fetch
    } catch (error: any) {
      toast({ title: "Error Updating Username", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
        toast({title: "Password Change", description: "Please enter and confirm your new password.", variant: "destructive"});
        return;
    }
    if (newPassword !== confirmPassword) {
        toast({title: "Password Mismatch", description: "New passwords do not match.", variant: "destructive"});
        return;
    }
    if (newPassword.length < 6) {
        toast({title: "Password Too Short", description: "Password must be at least 6 characters.", variant: "destructive"});
        return;
    }
    // TODO: Firebase Auth password change (requires re-authentication or is more complex)
    // For now, this is a placeholder.
    setIsSavingPassword(true);
    toast({ title: "Password Change", description: "Password change functionality is not fully implemented yet." });
    // Example: await updatePassword(auth.currentUser, newPassword);
    setIsSavingPassword(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  if (authLoading || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/3 mb-6 bg-muted/30" />
        <div className="neo-card p-6 md:p-8 max-w-lg mx-auto">
          <Skeleton className="h-8 w-1/4 mb-2 bg-muted/30" />
          <Skeleton className="h-10 w-full mb-4 bg-muted/20" />
          <Skeleton className="h-8 w-1/4 mb-2 bg-muted/30" />
          <Skeleton className="h-10 w-full mb-6 bg-muted/20" />
          <Skeleton className="h-12 w-full bg-muted/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-archivo mb-8 text-foreground">Your Profile</h1>
      
      <section className="neo-card p-6 md:p-8 max-w-lg mx-auto mb-10">
        <h2 className="text-2xl font-archivo mb-6 text-secondary">Account Information</h2>
        <form onSubmit={handleUsernameSubmit} className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="emailProfile" className="text-card-foreground font-semibold font-inter">Email</Label>
            <Input id="emailProfile" type="email" value={user?.email || ""} disabled className="neo-input bg-muted/30 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="usernameProfile" className="text-card-foreground font-semibold font-inter">Username</Label>
            <Input
              id="usernameProfile"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="neo-input"
              maxLength={20}
            />
          </div>
          <Button type="submit" className="neo-button w-full" disabled={isSavingUsername || username === userProfile.username}>
            {isSavingUsername ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSavingUsername ? "Saving Username..." : "Save Username"}
          </Button>
        </form>
      </section>

      <section className="neo-card p-6 md:p-8 max-w-lg mx-auto">
        <h2 className="text-2xl font-archivo mb-6 text-secondary">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="newPassword" className="text-card-foreground font-semibold font-inter">New Password</Label>
            <Input 
                id="newPassword" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="neo-input" 
                placeholder="New password (min. 6 characters)" 
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-card-foreground font-semibold font-inter">Confirm New Password</Label>
            <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="neo-input" 
                placeholder="Confirm new password"
            />
          </div>
          <Button type="submit" className="neo-button-secondary w-full" disabled={isSavingPassword}>
            {isSavingPassword ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSavingPassword ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      </section>
    </div>
  );
}

export default function ProfilePageContainer() {
  return <AuthGuard><ProfilePageContent /></AuthGuard>;
}
