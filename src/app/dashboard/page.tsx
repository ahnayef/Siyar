"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import TimelineCard from '@/components/dashboard/TimelineCard';
import CreateTimelineModal from '@/components/dashboard/CreateTimelineModal';
import type { Timeline } from '@/types';
import { getUserTimelines } from '@/lib/firestoreOps';
import { restoreTimelineAction } from '@/actions/timelineActions';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Search, SortAsc, SortDesc, Filter, X, RefreshCw, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function DashboardContent() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [filteredTimelines, setFilteredTimelines] = useState<Timeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');
  const [filterOption, setFilterOption] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserTimelines(user.uid, false) // Never show deleted items in dashboard
        .then(fetchedTimelines => {
          setTimelines(fetchedTimelines);
          setFilteredTimelines(fetchedTimelines);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  // Apply search, sort, and filter whenever they change or timelines change
  useEffect(() => {
    let result = [...timelines];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(timeline => 
        timeline.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filter
    if (filterOption !== 'all') {
      result = result.filter(timeline => 
        filterOption === 'public' ? timeline.isPublic : !timeline.isPublic
      );
    }
    
    // Apply sort
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'a-z':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    
    setFilteredTimelines(result);
  }, [timelines, searchQuery, sortOption, filterOption]);

  const handleTimelineCreated = (newTimeline: Timeline) => {
    setTimelines(prevTimelines => [newTimeline, ...prevTimelines]);
  };

  const handleTimelineDeleted = (deletedTimelineId: string) => {
    setTimelines(prevTimelines => prevTimelines.filter(timeline => timeline.id !== deletedTimelineId));
  };

  const handleRestoreTimeline = async (timelineId: string) => {
    if (!user) {
      return;
    }
    try {
      await restoreTimelineAction(user.uid, timelineId);
      // Refresh the timelines list
      setIsLoading(true);
      const fetchedTimelines = await getUserTimelines(user.uid, false);
      setTimelines(fetchedTimelines);
      setFilteredTimelines(fetchedTimelines);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error restoring timeline:", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSortChange = (value: 'newest' | 'oldest' | 'a-z' | 'z-a') => {
    setSortOption(value);
  };

  const handleFilterChange = (value: 'all' | 'public' | 'private') => {
    setFilterOption(value);
  };

  // Check for a restore parameter in the URL to handle restoring from timeline view
  useEffect(() => {
    const checkForRestoreParam = async () => {
      if (!user) return;
      
      // Check if we're in the browser environment
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const restoreTimelineId = urlParams.get('restore');
        
        if (restoreTimelineId) {
          try {
            // First check if the timeline exists and is in trash
            const allTimelines = await getUserTimelines(user.uid, true);
            const timelineToRestore = allTimelines.find(t => 
              t.id === restoreTimelineId && (t.deleted || t.isInTrash)
            );
            
            if (timelineToRestore) {
              // Attempt to restore
              await restoreTimelineAction(user.uid, restoreTimelineId);
              
              // Refresh the timelines list
              const fetchedTimelines = await getUserTimelines(user.uid, false);
              setTimelines(fetchedTimelines);
              setFilteredTimelines(fetchedTimelines);
              
              // Show success message
              toast({
                title: "Restored from Trash", 
                description: `"${timelineToRestore.title}" has been restored from trash.`,
                variant: "default"
              });
              
              // Remove the parameter from URL
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
            }
          } catch (error: any) {
            console.error("Error restoring timeline from URL parameter:", error);
            toast({
              title: "Error Restoring Timeline", 
              description: error.message || "Could not restore the timeline",
              variant: "destructive"
            });
          }
        }
      }
    };
    
    checkForRestoreParam();
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-1/3 bg-muted/30" />
          <Skeleton className="h-10 w-40 bg-muted/30" />
        </div>
        <Skeleton className="h-12 w-full mb-6 bg-muted/30" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[4px] bg-muted/20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Your Timelines</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="neo-button-outline">
            <Link href="/trash">
              <Trash2 className="mr-2 h-4 w-4" /> Trash Bin
            </Link>
          </Button>
          {userProfile && <CreateTimelineModal onTimelineCreated={handleTimelineCreated} />}
        </div>
      </div>
      
      {/* Search, Sort, Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center">
        <div className="relative w-full md:w-auto flex-1">
          <Input
            placeholder="Search timelines..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="neo-input py-5 pl-9 pr-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6" 
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 justify-end w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="neo-button-outline">
                <SortAsc className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="neo-card">
              <DropdownMenuItem 
                onClick={() => handleSortChange('newest')} 
                className={`cursor-pointer ${sortOption === 'newest' ? 'font-semibold bg-primary/5' : ''}`}
              >
                <SortDesc className="mr-2 h-4 w-4" /> Newest First
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSortChange('oldest')} 
                className={`cursor-pointer ${sortOption === 'oldest' ? 'font-semibold bg-primary/5' : ''}`}
              >
                <SortAsc className="mr-2 h-4 w-4" /> Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSortChange('a-z')} 
                className={`cursor-pointer ${sortOption === 'a-z' ? 'font-semibold bg-primary/5' : ''}`}
              >
                <SortAsc className="mr-2 h-4 w-4" /> A-Z
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSortChange('z-a')} 
                className={`cursor-pointer ${sortOption === 'z-a' ? 'font-semibold bg-primary/5' : ''}`}
              >
                <SortDesc className="mr-2 h-4 w-4" /> Z-A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="neo-button-outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="neo-card">
              <DropdownMenuItem 
                onClick={() => handleFilterChange('all')} 
                className={`cursor-pointer ${filterOption === 'all' ? 'font-semibold bg-primary/5' : ''}`}
              >
                All Timelines
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleFilterChange('public')} 
                className={`cursor-pointer ${filterOption === 'public' ? 'font-semibold bg-primary/5' : ''}`}
              >
                Public Only
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleFilterChange('private')} 
                className={`cursor-pointer ${filterOption === 'private' ? 'font-semibold bg-primary/5' : ''}`}
              >
                Private Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Active Filter Badges */}
        {(searchQuery || filterOption !== 'all' || sortOption !== 'newest') && (
          <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
            {searchQuery && (
              <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                Search: {searchQuery}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={handleClearSearch}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filterOption !== 'all' && (
              <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                {filterOption === 'public' ? 'Public Only' : 'Private Only'}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => handleFilterChange('all')}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {filteredTimelines.length === 0 ? (
        <div className="text-center py-12 neo-card">
          {timelines.length === 0 ? (
            <>
              <PlusCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2 text-foreground">Create Your First Timeline</h2>
              <p className="text-muted-foreground mb-4 text-body-md">
                Your journey starts here. Create your first timeline to start mapping out your events and milestones.
              </p>
              {userProfile && <CreateTimelineModal buttonText="Create Your First Timeline" onTimelineCreated={handleTimelineCreated} />}
            </>
          ) : (
            <>
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2 text-foreground">No Matching Timelines</h2>
              <p className="text-muted-foreground mb-4 text-body-md">
                No timelines matched your current search or filters. Try adjusting your criteria.
              </p>
              <Button variant="outline" onClick={handleClearSearch} className="neo-button-outline">
                Clear All Filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTimelines.map((timeline) => (
            <TimelineCard key={timeline.id} timeline={timeline} onTimelineDeleted={handleTimelineDeleted} onTimelineRestored={handleRestoreTimeline} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
