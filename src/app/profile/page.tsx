"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { updateUserUsernameAction } from "@/actions/profileActions"; 
import { deleteUserDataAction } from "@/actions/accountActions";
import { logAnalyticsEvent } from "@/lib/analytics";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";

function ProfilePageContent() {
  const { user, userProfile, loading: authLoading, refreshUserProfile } = useAuth(); 
  const { toast } = useToast();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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
      await updateUserUsernameAction(user.uid, username);
      toast({ title: "Username Updated!", description: `Your username is now ${username}.` });
      logAnalyticsEvent('update_username', { user_id: user.uid });
      if(refreshUserProfile) await refreshUserProfile(); 
    } catch (error: any) {
      toast({ title: "Error Updating Username", description: error.message, variant: "destructive" });
      logAnalyticsEvent('update_username_failed', { user_id: user.uid, error_message: error.message });
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
    // logAnalyticsEvent('update_password_attempt', { user_id: user?.uid }); // Example, actual event on success
    setIsSavingPassword(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = async () => {
    if (!user || !userProfile) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }

    if (deleteConfirmText !== "DELETE") {
      toast({ 
        title: "Confirmation Required", 
        description: "Please type DELETE to confirm account deletion.", 
        variant: "destructive" 
      });
      return;
    }

    setIsDeletingAccount(true);
    try {
      const userId = user.uid;
      const username = userProfile.username;
      
      console.log("Starting account deletion for user:", userId);
      
      // First delete all Firestore data
      console.log("Deleting Firestore data...");
      await deleteUserDataAction(userId, username);
      console.log("Firestore data deleted successfully");
      
      // Log the event before user is deleted
      logAnalyticsEvent('account_deleted', { user_id: userId });
      
      // Then delete the Firebase Auth user (must be done on client side)
      console.log("Deleting Firebase Auth user...");
      await deleteUser(user);
      console.log("Firebase Auth user deleted successfully");
      
      // Show success message
      toast({ 
        title: "Account Deleted", 
        description: "Your account and all associated data have been deleted.",
      });
      
      // Sign out is automatic after deleteUser, redirect to home
      // Small delay to ensure the toast is visible
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      
      let errorMessage = "Failed to delete account. Please try again or contact support.";
      
      // Handle specific Firebase Auth errors
      if (error.code === "auth/requires-recent-login") {
        errorMessage = "For security, please log out and log back in, then try deleting your account again.";
      }
      
      toast({ 
        title: "Error Deleting Account", 
        description: errorMessage,
        variant: "destructive" 
      });
      logAnalyticsEvent('account_deletion_failed', { 
        user_id: user?.uid, 
        error_message: error.message,
        error_code: error.code 
      });
    } finally {
      setIsDeletingAccount(false);
      setDeleteConfirmText("");
    }
  };

  if (authLoading || !userProfile && !authLoading) { 
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
  
  if (!userProfile && !authLoading) { 
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-destructive text-lg">Could not load user profile. Please try again later.</p>
        </div>
    )
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
          <Button type="submit" className="neo-button w-full" disabled={isSavingUsername || username === userProfile?.username}>
            {isSavingUsername ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSavingUsername ? "Saving Username..." : "Save Username"}
          </Button>
        </form>
      </section>

      <section className="neo-card p-6 md:p-8 max-w-lg mx-auto mb-10">
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

      {/* Danger Zone: Delete Account */}
      <section className="neo-card p-6 md:p-8 max-w-lg mx-auto border-destructive bg-destructive/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <h2 className="text-2xl font-archivo text-destructive">Danger Zone</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Deleting your account is permanent and cannot be undone. This will:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Delete your account permanently</li>
            <li>Remove all your timelines and events</li>
            <li>Free up your username</li>
            <li>Remove all your personal data</li>
          </ul>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground neo-button-outline mt-4"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="neo-card max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-archivo flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  Delete Account?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-body-md">
                  This action cannot be undone. All your data will be permanently deleted from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="my-4">
                <Label htmlFor="deleteConfirm" className="text-sm font-semibold text-foreground">
                  Type <span className="font-mono bg-destructive/10 px-1 py-0.5 rounded text-destructive">DELETE</span> to confirm
                </Label>
                <Input
                  id="deleteConfirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="neo-input mt-2"
                  placeholder="Type DELETE"
                />
              </div>

              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel 
                  className="neo-button-outline"
                  onClick={() => setDeleteConfirmText("")}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="neo-button-destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmText !== "DELETE"}
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete My Account
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}

export default function ProfilePageContainer() {
  return <AuthGuard><ProfilePageContent /></AuthGuard>;
}
