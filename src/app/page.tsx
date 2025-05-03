'use client';

import { useState, useCallback, useEffect } from 'react';
import SummaryFeed from '@/components/home/SummaryFeed';
import SearchBar from '@/components/home/SearchBar';
import FilterOptions from '@/components/home/FilterOptions';
import DailySummary from '@/components/home/DailySummary';
import { FilterOptions as FilterOptionsType, SortOrder, MeetingWithTags } from '@/types';
import { getAllMeetings } from '@/services/meetingService';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptionsType>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [meetings, setMeetings] = useState<MeetingWithTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSearch = useCallback((query: string) => {
    console.log('Search query updated:', query);
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterOptionsType) => {
    console.log('Filters updated:', newFilters);
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((order: SortOrder) => {
    console.log('Sort order updated:', order);
    setSortOrder(order);
  }, []);
  
  // Fetch meetings when component mounts
  useEffect(() => {
    const fetchMeetings = async () => {
      setIsLoading(true);
      try {
        const fetchedMeetings = await getAllMeetings();
        setMeetings(fetchedMeetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setIsLoading(false);
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
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <FilterOptions onFilterChange={handleFilterChange} />
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <SearchBar onSearch={handleSearch} onSortChange={handleSortChange} />
          {!isLoading && <DailySummary meetings={meetings} />}
          <SummaryFeed 
            searchQuery={searchQuery} 
            filters={filters} 
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </div>
  );
}