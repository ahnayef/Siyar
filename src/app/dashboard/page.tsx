
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import TimelineCard from '@/components/dashboard/TimelineCard';
import CreateTimelineModal from '@/components/dashboard/CreateTimelineModal';
import type { Timeline } from '@/types';
import { getUserTimelines } from '@/lib/firestoreOps';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Search, SortAsc, SortDesc, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

function DashboardContent() {
  const { user, userProfile } = useAuth();
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [filteredTimelines, setFilteredTimelines] = useState<Timeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');
  const [filterOption, setFilterOption] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserTimelines(user.uid)
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
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Your Timelines</h1>
        {userProfile && <CreateTimelineModal onTimelineCreated={handleTimelineCreated} />}
      </div>
      
      {/* Search, Sort and Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Search Input */}
          <div className="relative flex-1 border border-muted border-black rounded-md">
            <Input
              type="text"
              placeholder="Search timelines..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="neo-input-outline w-full pl-10 pr-10"
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
          
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="neo-button-outline gap-2 min-w-[140px]">
                {sortOption === 'newest' && <SortDesc className="h-4 w-4" />}
                {sortOption === 'oldest' && <SortAsc className="h-4 w-4" />}
                {sortOption === 'a-z' && <SortAsc className="h-4 w-4" />}
                {sortOption === 'z-a' && <SortDesc className="h-4 w-4" />}
                
                {sortOption === 'newest' && 'Newest First'}
                {sortOption === 'oldest' && 'Oldest First'}
                {sortOption === 'a-z' && 'A to Z'}
                {sortOption === 'z-a' && 'Z to A'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="neo-card">
              <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                <SortDesc className="mr-2 h-4 w-4" /> Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                <SortAsc className="mr-2 h-4 w-4" /> Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('a-z')}>
                <SortAsc className="mr-2 h-4 w-4" /> A to Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('z-a')}>
                <SortDesc className="mr-2 h-4 w-4" /> Z to A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="neo-button-outline gap-2 min-w-[120px]">
                <Filter className="h-4 w-4" />
                {filterOption === 'all' && 'All'}
                {filterOption === 'public' && 'Public'}
                {filterOption === 'private' && 'Private'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="neo-card">
              <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                All Timelines
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('public')}>
                Public Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('private')}>
                Private Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Active Filters Display */}
        {(searchQuery || filterOption !== 'all') && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="outline" className="flex items-center gap-1 neo-badge">
                Search: {searchQuery}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={handleClearSearch}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filterOption !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1 neo-badge">
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
              <h2 className="text-2xl font-semibold mb-2 text-foreground">No Timelines Yet!</h2>
              <p className="text-muted-foreground mb-4 text-body-md">Get started by creating your first timeline.</p>
              {userProfile && <CreateTimelineModal onTimelineCreated={handleTimelineCreated} />}
            </>
          ) : (
            <>
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2 text-foreground">No Matching Timelines</h2>
              <p className="text-muted-foreground mb-4 text-body-md">Try adjusting your search or filters.</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setFilterOption('all');
              }} className="neo-button-outline">
                Clear All Filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTimelines.map((timeline) => (
            <TimelineCard key={timeline.id} timeline={timeline} onTimelineDeleted={handleTimelineDeleted} />
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
