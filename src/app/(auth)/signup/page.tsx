
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { logAnalyticsEvent } from '@/lib/analytics';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSignup = async (data: any) => {
    try {
      const usernameDocRef = doc(db, "usernames", data.username.toLowerCase());
      const usernameDocSnap = await getDoc(usernameDocRef);
      if (usernameDocSnap.exists()) {
        throw new Error("Username already taken. Please choose another one.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const userFB = userCredential.user;

      if (userFB) {
        const userDocRef = doc(db, "users", userFB.uid);
        await setDoc(userDocRef, {
          uid: userFB.uid,
          email: userFB.email,
          username: data.username,
          createdAt: serverTimestamp(),
        });
        await setDoc(usernameDocRef, { userId: userFB.uid });
      }
      
      toast({ title: "Signup Successful", description: "Welcome to Siyar!" });
      logAnalyticsEvent('sign_up', { method: 'email_password', user_id: userFB?.uid });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = "Failed to sign up. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Try logging in.";
      } else if (error.message === "Username already taken. Please choose another one.") {
        errorMessage = error.message;
      }
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      logAnalyticsEvent('signup_failed', { method: 'email_password', error_message: error.message, error_code: error.code });
      throw new Error(errorMessage);
    }
  };

  if (authLoading || user) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Skeleton className="h-12 w-1/2 mb-4 bg-muted/30" />
        <Skeleton className="h-48 w-full max-w-md bg-muted/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-archivo text-foreground">Create Your Siyar Account</h1>
        <p className="text-muted-foreground mt-2 text-body-md">Start managing your timelines like a pro.</p>
      </div>
      <AuthForm mode="signup" onSubmit={handleSignup} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in here
        </Link>
      </p>
    </div>
  );
}
