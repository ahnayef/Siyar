
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut, UserCircle, LayoutDashboard, Workflow, Menu, X } from 'lucide-react'; 
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton'; // Ensure Skeleton is imported

export default function Navbar() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsMobileMenuOpen(false);
      router.push('/'); 
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const commonLinks = (isMobile = false) => (
    <>
      {user ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="neo-button-outline px-3 py-1.5 text-sm flex items-center gap-1.5">
                <UserCircle className="h-5 w-5" /> 
                <span className="hidden md:inline">{userProfile?.username || user.email?.split('@')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="neo-card mt-2 w-56">
              <DropdownMenuLabel className="font-archivo text-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <UserCircle className="mr-2 h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <Button variant="ghost" size="sm" asChild className="neo-button px-4 py-1.5 text-sm">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="neo-button-outline px-3 py-1.5 text-sm">
            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
          </Button>
        </>
      )}
    </>
  );


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-sm border-b-2 border-strong-border-color">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-archivo text-primary hover:opacity-80 transition-opacity flex items-center gap-2">
          <Workflow className="h-7 w-7 text-primary"/>
          Siyar
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && commonLinks()}
          {loading && <Skeleton className="w-24 h-9 bg-muted/30 rounded-[4px]" />}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          {!loading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground focus:ring-primary"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
          {loading && <Skeleton className="w-9 h-9 bg-muted/30 rounded-[4px]" />}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && !loading && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background shadow-lg p-4 border-t-2 border-strong-border-color">
          <div className="flex flex-col items-center gap-4">
            {commonLinks(true)}
          </div>
        </div>
      )}
    </nav>
  );
}
    
