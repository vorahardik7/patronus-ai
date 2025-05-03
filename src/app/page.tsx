'use client';

import { useState, useCallback, useEffect } from 'react';
import SummaryFeed from '@/components/home/SummaryFeed';
import SearchBar from '@/components/home/SearchBar';
import DailySummary from '@/components/home/DailySummary';
import { SortOrder, MeetingWithTags } from '@/types';
import { getAllMeetings } from '@/services/meetingService';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [meetings, setMeetings] = useState<MeetingWithTags[]>([]);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSearch = useCallback((query: string) => {
    console.log('Search query updated:', query);
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((order: SortOrder) => {
    console.log('Sort order updated:', order);
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
          <DailySummary meetings={meetings} />
          <SummaryFeed 
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
}