"use client";

import type React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return null;
  }

  // Block access if email is not verified
  if (!user.emailVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card className="neo-card border-warning">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
              <CardTitle className="text-3xl font-archivo">Email Not Verified</CardTitle>
              <CardDescription className="text-body-md mt-2">
                You need to verify your email address before accessing your dashboard.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-warning/10 border-2 border-warning/30 rounded-[4px] p-4">
                <p className="text-sm text-foreground">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please check your inbox for the verification link we sent you.
                </p>
              </div>

              <Button 
                className="w-full neo-button"
                onClick={() => {
                  auth.signOut();
                  router.push('/signup');
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Go to Verification Page
              </Button>

              <div className="text-center pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    auth.signOut();
                    router.push('/login');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
