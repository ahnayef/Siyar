
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { logAnalyticsEvent } from '@/lib/analytics';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (data: any) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      logAnalyticsEvent('login', { method: 'email_password', user_id: auth.currentUser?.uid });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = "Failed to login. Please check your credentials.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      }
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      logAnalyticsEvent('login_failed', { method: 'email_password', error_code: error.code });
      throw new Error(errorMessage); 
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Skeleton className="h-12 w-1/2 mb-4 bg-muted/30" />
        <Skeleton className="h-40 w-full max-w-md bg-muted/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-archivo text-foreground">Log In to Siyar</h1>
        <p className="text-muted-foreground mt-2 text-body-md">Access your timelines and stay organized.</p>
      </div>
      <AuthForm mode="login" onSubmit={handleLogin} />
      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
          Forgot your password?
        </Link>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign up here
        </Link>
      </p>
    </div>
  );
}
