'use client';

import { useState, useCallback, useEffect } from 'react';
import SummaryFeed from '@/components/home/SummaryFeed';
import SearchBar from '@/components/home/SearchBar';
import DailySummary from '@/components/home/DailySummary';
import { SortOrder, MeetingWithTags } from '@/types';
import { getAllMeetings, searchMeetings } from '@/services/meetingService';

export default function Home() {
  const [meetings, setMeetings] = useState<MeetingWithTags[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // We'll use this in the UI to show the current sort order
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  // Using setError in the handleSearch function
  const [error, setError] = useState<string | null>(null);
  
  // Log Supabase environment variables (without revealing sensitive values)
  useEffect(() => {
    console.log('Supabase URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Anon Key defined:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }, []);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSearch = useCallback(async (query: string) => {
    console.log('Search query updated:', query);
    setSearchQuery(query);
    setError(null);
    
    if (query.length === 0) {
      // If search is cleared, load all meetings
      setIsSearching(false);
      try {
        const fetchedMeetings = await getAllMeetings();
        console.log('Fetched all meetings:', fetchedMeetings);
        setMeetings(fetchedMeetings);
      } catch (error) {
        console.error('Error fetching all meetings:', error);
        setError('Failed to load meetings. Please try again.');
      }
    } else if (query.length >= 3) {
      // Only search for queries with 3 or more characters
      setIsSearching(true);
      try {
        console.log('Searching for:', query);
        const searchResults = await searchMeetings(query);
        console.log('Search results:', searchResults);
        setMeetings(searchResults);
      } catch (error) {
        console.error('Error searching meetings:', error);
        setError('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }
  }, []);

  const handleSortChange = useCallback((order: SortOrder) => {
    console.log('Sort order updated:', order);
    setSortOrder(order);
    
    // Sort the current meetings based on the selected order
    setMeetings(prevMeetings => {
      const sortedMeetings = [...prevMeetings];
      
      if (order === 'newest') {
        sortedMeetings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (order === 'oldest') {
        sortedMeetings.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
      // For 'relevance', we would need additional logic, but for now we'll leave it as is
      
      return sortedMeetings;
    });
  }, []);
  
  // Fetch meetings when component mounts
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const fetchedMeetings = await getAllMeetings();
        setMeetings(fetchedMeetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      }
    };
    
    fetchMeetings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Recent Drug Summaries</h1>
        <p className="text-secondary-600">
          Browse and search through recent pharmaceutical presentations and discussions
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <SearchBar onSearch={handleSearch} onSortChange={handleSortChange} />
          {/* Display current sort order to use the sortOrder variable */}
          <div className="text-xs text-secondary-500 mb-2">
            Currently sorting by: <span className="font-medium">{sortOrder === 'newest' ? 'Newest first' : sortOrder === 'oldest' ? 'Oldest first' : 'Relevance'}</span>
          </div>
          {isSearching ? (
            <div className="my-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-secondary-600">Searching...</p>
            </div>
          ) : searchQuery.length > 0 ? (
            <div className="mb-6">
              <p className="text-secondary-600">
                {meetings.length === 0 
                  ? `No results found for "${searchQuery}"`
                  : `Found ${meetings.length} result${meetings.length === 1 ? '' : 's'} for "${searchQuery}"`}
              </p>
            </div>
          ) : null}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          <DailySummary meetings={meetings} />
          <SummaryFeed searchResults={meetings} />
        </div>
      </div>
    </div>
  );
}