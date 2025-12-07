
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { logAnalyticsEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [verificationSent, setVerificationSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!authLoading && user) {
        // Reload user to get latest verification status
        await user.reload();
        
        // Check if email is verified
        if (user.emailVerified) {
          router.push('/dashboard');
        } else if (!verificationSent) {
          // User is signed in but email not verified, show verification screen
          setVerificationSent(true);
          setUserEmail(user.email || '');
        }
      }
    };
    
    checkUserStatus();
  }, [user, authLoading, router, verificationSent]);

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
          emailVerified: false,
        });
        await setDoc(usernameDocRef, { userId: userFB.uid });

        // Send verification email
        await sendEmailVerification(userFB);
        setVerificationSent(true);
        setUserEmail(userFB.email || '');
        
        toast({ 
          title: "Verification Email Sent", 
          description: "Please check your email to verify your account." 
        });
        logAnalyticsEvent('sign_up', { method: 'email_password', user_id: userFB?.uid });
      }
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

  const handleResendVerification = async () => {
    if (!user) return;
    
    try {
      await sendEmailVerification(user);
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox for the verification link.",
      });
      logAnalyticsEvent('resend_verification_email', { user_id: user.uid });
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    
    try {
      await user.reload();
      if (user.emailVerified) {
        // Update Firestore
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { emailVerified: true }, { merge: true });
        
        toast({
          title: "Email Verified!",
          description: "Welcome to Siyar!",
        });
        logAnalyticsEvent('email_verified', { user_id: user.uid });
        router.push('/dashboard');
      } else {
        toast({
          title: "Not Verified Yet",
          description: "Please click the verification link in your email.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error checking verification:", error);
      toast({
        title: "Error",
        description: "Failed to check verification status.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Skeleton className="h-12 w-1/2 mb-4 bg-muted/30" />
        <Skeleton className="h-48 w-full max-w-md bg-muted/20" />
      </div>
    );
  }

  // Show verification screen if email was sent
  if (verificationSent && user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card className="neo-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-archivo">Verify Your Email</CardTitle>
              <CardDescription className="text-body-md mt-2">
                We sent a verification link to <strong className="text-foreground">{userEmail}</strong>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-muted/50 border-2 border-border rounded-[4px] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Click the verification link</p>
                    <p className="text-muted-foreground">Check your inbox and click the link we sent you to verify your email address.</p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full neo-button"
                onClick={handleCheckVerification}
              >
                I&apos;ve Verified My Email
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn&apos;t receive the email?
                </p>
                <Button 
                  variant="outline" 
                  className="neo-button-outline"
                  onClick={handleResendVerification}
                >
                  Resend Verification Email
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    auth.signOut();
                    setVerificationSent(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign up with a different email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
