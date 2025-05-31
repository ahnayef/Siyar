
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut, LogIn, UserPlus, LayoutDashboard, Workflow } from 'lucide-react'; 

export default function Navbar() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/'); 
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md shadow-sm border-b-2 border-strong-border-color">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-archivo text-primary hover:opacity-80 transition-opacity flex items-center gap-2">
          <Workflow className="h-7 w-7 text-primary"/>
          ChronoFlow
        </Link>
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-24 h-9 bg-muted rounded animate-pulse"></div>
          ) : user ? (
            <>
              <span className="text-sm hidden md:inline text-muted-foreground font-inter">
                Hi, {userProfile?.username || user.email?.split('@')[0]}
              </span>
              <Button variant="ghost" size="sm" asChild className="neo-button-outline px-3 py-1.5 text-sm">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="neo-button bg-destructive text-destructive-foreground hover:bg-destructive/90 w-9 h-9" title="Sign Out">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="neo-button px-4 py-1.5 text-sm">
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4" /> Login
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="neo-button-outline px-3 py-1.5 text-sm">
                <Link href="/signup">
                  <UserPlus className="mr-1.5 h-4 w-4" /> Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
    