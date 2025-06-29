
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut, UserCircle, LayoutDashboard, Menu, X, Trash2, Info } from 'lucide-react'; 
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
import Logo from '@/Icon/Logo';

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

  const DesktopUserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="neo-button-outline px-3 py-1.5 text-sm flex items-center gap-1.5 shadow-neo-hover hover:shadow-neo active:shadow-neo-active">
          <UserCircle className="h-5 w-5" /> 
          <span className="hidden md:inline">{userProfile?.username || user?.email?.split('@')[0] || 'Account'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-2 w-56 shadow-neo">
        <DropdownMenuLabel className="font-archivo text-foreground">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
          <Link href="/trash" onClick={() => setIsMobileMenuOpen(false)}>
            <Trash2 className="mr-2 h-4 w-4" /> Trash Bin
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
            <UserCircle className="mr-2 h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
            <Info className="mr-2 h-4 w-4" /> About Siyar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileUserProfile = () => (
    <div className="w-full">
      <div className="flex items-center mb-5 p-3">
        <UserCircle className="h-6 w-6 mr-2" />
        <span className="font-medium">{userProfile?.username || user?.email?.split('@')[0] || 'Account'}</span>
      </div>
      <div className="flex flex-col space-y-3 w-full">
        <Link 
          href="/dashboard" 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="flex items-center px-4 py-3 bg-background border border-strong-border-color shadow-neo-hover hover:shadow-neo active:shadow-neo-active rounded-md transition-all font-medium"
        >
          <LayoutDashboard className="mr-3 h-5 w-5" /> 
          <span>Dashboard</span>
        </Link>
        <Link 
          href="/trash" 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="flex items-center px-4 py-3 bg-background border border-strong-border-color shadow-neo-hover hover:shadow-neo active:shadow-neo-active rounded-md transition-all font-medium"
        >
          <Trash2 className="mr-3 h-5 w-5" /> 
          <span>Trash Bin</span>
        </Link>
        <Link 
          href="/profile" 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="flex items-center px-4 py-3 bg-background border border-strong-border-color shadow-neo-hover hover:shadow-neo active:shadow-neo-active rounded-md transition-all font-medium"
        >
          <UserCircle className="mr-3 h-5 w-5" /> 
          <span>Profile</span>
        </Link>
        <Link 
          href="/about" 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="flex items-center px-4 py-3 bg-background border border-strong-border-color shadow-neo-hover hover:shadow-neo active:shadow-neo-active rounded-md transition-all font-medium"
        >
          <Info className="mr-3 h-5 w-5" /> 
          <span>About Siyar</span>
        </Link>
        <button 
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 bg-destructive/10 border border-destructive text-destructive font-medium shadow-neo-hover hover:shadow-neo active:shadow-neo-active rounded-md transition-all text-left"
        >
          <LogOut className="mr-3 h-5 w-5" /> 
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const NonUserLinks = ({ isMobile = false }) => (
    <>
      {isMobile ? (
        <div className="flex flex-col space-y-3 w-full">
          <Link 
            href="/about" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex items-center justify-center px-4 py-3 bg-background border border-strong-border-color shadow-neo-hover hover:shadow-neo active:shadow-neo-active rounded-md transition-all font-medium"
          >
            <Info className="mr-3 h-5 w-5" /> 
            <span>About Siyar</span>
          </Link>
          <Link 
            href="/login" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className=" flex items-center justify-center px-4 py-3 bg-primary/10 border border-primary shadow-neo-hover hover:shadow-neo active:shadow-neo-active rounded-md transition-all font-medium"
          >
            <span>Login</span>
          </Link>
          <Link 
            href="/signup" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex items-center justify-center px-4 py-3 bg-primary/5 border border-primary shadow-neo-hover hover:shadow-neo active:shadow-neo-active rounded-md transition-all font-medium"
          >
            <span>Sign Up</span>
          </Link>
        </div>
      ) : (
        <>
          <Button variant="outline" size="sm" asChild className="neo-button-outline text-sm border shadow-neo-hover hover:shadow-neo active:shadow-neo-active">
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="neo-button-outline text-sm border border-primary bg-primary/10 shadow-neo-hover hover:shadow-neo active:shadow-neo-active">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="neo-button-outline text-sm border shadow-neo-hover hover:shadow-neo active:shadow-neo-active">
            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
          </Button>
        </>
      )}
    </>
  );

  const commonLinks = (isMobile = false) => (
    <>
      {user ? (
        isMobile ? <MobileUserProfile /> : <DesktopUserMenu />
      ) : (
        <NonUserLinks isMobile={isMobile} />
      )}
    </>
  );


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-sm border-b border-strong-border-color">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-archivo text-primary hover:opacity-80 transition-opacity flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" />
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
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background shadow-neo border-t border-strong-border-color z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="py-5 px-4 sm:px-6">
            <div className="mx-auto max-w-md">
              {commonLinks(true)}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
    
