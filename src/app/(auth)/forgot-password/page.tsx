"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logAnalyticsEvent } from '@/lib/analytics';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
      logAnalyticsEvent('password_reset_requested', { email });
    } catch (error: any) {
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }
      
      console.error("Password reset error:", error);
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      logAnalyticsEvent('password_reset_failed', { error_code: error.code });
    } finally {
      setIsSubmitting(false);
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
      <div className="w-full max-w-md">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <Card className="neo-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-archivo">Forgot Password?</CardTitle>
            <CardDescription className="text-body-md mt-2">
              {emailSent 
                ? "We've sent you a password reset link"
                : "Enter your email and we'll send you reset instructions"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-[4px] p-4 text-center">
                  <p className="text-sm text-foreground">
                    Check your email at <strong className="font-semibold">{email}</strong> for a link to reset your password.
                  </p>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>Didn&apos;t receive the email? Check your spam folder or</p>
                  <button 
                    onClick={() => setEmailSent(false)}
                    className="text-primary hover:underline font-semibold mt-1"
                  >
                    try another email address
                  </button>
                </div>

                <Button 
                  className="w-full neo-button mt-4"
                  onClick={() => router.push('/login')}
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="neo-input"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full neo-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
