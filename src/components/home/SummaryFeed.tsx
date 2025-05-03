// src/components/home/SummaryFeed.tsx
'use client';

import { useEffect, useState } from 'react';
import SummaryCard from './SummaryCard';
import { Summary, FilterOptions, SortOrder, meetingToSummary, MeetingWithTags } from '@/types';
import { getAllMeetings, searchMeetings } from '@/services/meetingService';
import RealtimeSpeechAgent from '../speech/RealtimeSpeechAgent';

// Mock data for demo purposes
const MOCK_SUMMARIES: Summary[] = [
  {
    id: '1',
    title: 'Cardiofix for Hypertension',
    drugName: 'Cardiofix',
    createdAt: '2025-05-01T10:30:00Z',
    updatedAt: '2025-05-01T10:30:00Z',
    presenter: 'Jane Smith',
    doctorName: 'Dr. Michael Chen',
    keyPoints: [
      'Reduces blood pressure by 20% more effectively than leading competitors',
      'Minimal side effects in clinical trials',
      'Suitable for patients with diabetes',
      'Once-daily dosing for better compliance'
    ],
    relevantPatients: 45,
    tags: ['hypertension', 'cardiology', 'blood pressure']
  },
  {
    id: '2',
    title: 'NeuroCare for Alzheimer\'s',
    drugName: 'NeuroCare',
    createdAt: '2025-04-28T14:15:00Z',
    updatedAt: '2025-04-28T14:15:00Z',
    presenter: 'Mark Wilson',
    doctorName: 'Dr. Emily Rodriguez',
    keyPoints: [
      'Shows promising results in slowing cognitive decline',
      'Improves memory function in early-stage patients',
      'Minimal impact on liver function',
      'Weekly injection administered by healthcare provider'
    ],
    relevantPatients: 23,
    tags: ['alzheimer\'s', 'neurology', 'cognitive function']
  },
  {
    id: '3',
    title: 'RespiClear for COPD',
    drugName: 'RespiClear',
    createdAt: '2025-04-25T09:45:00Z',
    updatedAt: '2025-04-25T16:20:00Z',
    presenter: 'Amanda Johnson',
    doctorName: 'Dr. James Wilson',
    keyPoints: [
      'Improves lung function within 48 hours',
      'Reduces hospitalization rates by 35%',
      'Compatible with other respiratory medications',
      'New inhalation device improves drug delivery to lungs'
    ],
    relevantPatients: 38,
    tags: ['COPD', 'respiratory', 'pulmonology']
  },
  {
    id: '4',
    title: 'GastroEase for IBS',
    drugName: 'GastroEase',
    createdAt: '2025-04-22T11:30:00Z',
    updatedAt: '2025-04-22T11:30:00Z',
    presenter: 'Thomas Brown',
    doctorName: 'Dr. Rachel Green',
    keyPoints: [
      'Provides relief from IBS symptoms within 2 hours',
      'Long-lasting effect up to 24 hours',
      'Minimal digestive side effects',
      'Can be taken with or without food'
    ],
    relevantPatients: 29,
    tags: ['IBS', 'gastroenterology', 'digestive']
  },
];

interface SummaryFeedProps {
  searchQuery: string;
  filters: FilterOptions;
  sortOrder: SortOrder;
}

export default function SummaryFeed({ searchQuery, filters, sortOrder }: SummaryFeedProps) {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [fullMeetingsData, setFullMeetingsData] = useState<MeetingWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Fetch initial data on component mount
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const meetings = await getAllMeetings();
        
        // Store the full meeting data
        setFullMeetingsData(meetings);
        
        // Convert real data to Summary format
        const convertedSummaries = meetings.map(meeting => meetingToSummary(meeting));
        
        // Combine real data with mock data for demo purposes
        // In production, you'd likely just use the real data
        const allSummaries = [...convertedSummaries, ...MOCK_SUMMARIES];
        setSummaries(allSummaries);
        
        console.log(`Loaded ${meetings.length} real meetings and ${MOCK_SUMMARIES.length} mock meetings`);
      } catch (err) {
        console.error('Error fetching initial meetings:', err);
        setError('Failed to load meetings. Using mock data instead.');
        // Keep mock data for summaries, clear full data on error?
        setFullMeetingsData([]);
        setSummaries([...MOCK_SUMMARIES]);
      } finally {
        setLoading(false);
        setInitialDataLoaded(true);
      }
    }

    fetchInitialData();
  }, []);

  // Handle search, filter, and sort in a single useEffect
  useEffect(() => {
    if (!initialDataLoaded) return;

    const performSearchAndFilter = async () => {
      setLoading(true);
      
      try {
        // For significant search queries (3+ chars), fetch from the database
        if (searchQuery && searchQuery.length >= 3) {
          console.log(`Searching database for: "${searchQuery}"`);
          
          // First search for meetings that match the query
          const searchResults = await searchMeetings(searchQuery);
          
          // Store the full meeting data from search
          setFullMeetingsData(searchResults);
          
          // Convert to Summary format
          let searchedSummaries = searchResults.map(meeting => meetingToSummary(meeting));
          
          // Also search specifically in tags (if not already found)
          // We need to make sure the searchMeetings function properly searches in tags
          
          // Apply filters
          searchedSummaries = applyFiltersAndSort(searchedSummaries, filters, sortOrder);
          
          console.log(`Found ${searchedSummaries.length} results from database search`);
          setSummaries(searchedSummaries);
        } else {
          // For empty/short search, load all data again and apply filters locally
          const meetings = await getAllMeetings();
          const convertedSummaries = meetings.map(meeting => meetingToSummary(meeting));
          const allSummaries = [...convertedSummaries, ...MOCK_SUMMARIES];
          
          // Also store the full data when loading all for local filtering
          const allFullMeetings = [...meetings]; // Assuming no mock data has full MeetingWithTags structure
          setFullMeetingsData(allFullMeetings);

          // If we have a 1-2 character search, filter locally
          let filteredSummaries = allSummaries;
          if (searchQuery && searchQuery.length < 3) {
            const query = searchQuery.toLowerCase();
            filteredSummaries = allSummaries.filter(summary => 
              summary.title.toLowerCase().includes(query) ||
              summary.drugName.toLowerCase().includes(query) ||
              summary.doctorName.toLowerCase().includes(query) ||
              summary.keyPoints.some(point => point.toLowerCase().includes(query)) ||
              summary.tags.some(tag => tag.toLowerCase().includes(query))
            );
          }
          
          // Apply other filters and sorting
          filteredSummaries = applyFiltersAndSort(filteredSummaries, filters, sortOrder);
          
          setSummaries(filteredSummaries);

          // Optionally filter the full data too if needed immediately, but for now 
          // the primary goal is just to have it available
        }
        
        setError(null);
      } catch (err) {
        console.error('Error in search and filter:', err);
        setError('An error occurred while searching or filtering. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Use debounce to prevent too many API calls
    const debounceTimeout = setTimeout(() => {
      performSearchAndFilter();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, filters, sortOrder, initialDataLoaded]);

  // Helper function to apply filters and sorting
  const applyFiltersAndSort = (items: Summary[], filters: FilterOptions, sortOrder: SortOrder): Summary[] => {
    let result = [...items];
    
    // Apply date range filter
    if (filters.dateRange) {
      result = result.filter(summary => {
        const createdDate = new Date(summary.createdAt);
        return createdDate >= filters.dateRange!.start && createdDate <= filters.dateRange!.end;
      });
    }
    
    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(summary => 
        filters.tags!.some(tag => summary.tags.includes(tag))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        // For relevance, we'll sort by number of relevant patients (if available)
        const aRelevance = a.relevantPatients || 0;
        const bRelevance = b.relevantPatients || 0;
        return bRelevance - aRelevance;
      }
    });
    
    return result;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-secondary-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-secondary-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-secondary-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-secondary-200 rounded w-2/3 mb-4"></div>
            <div className="flex space-x-2 mt-4">
              <div className="h-6 bg-secondary-100 rounded-full w-16"></div>
              <div className="h-6 bg-secondary-100 rounded-full w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="mt-6 card p-6 border-red-300 bg-red-50">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  // Render empty state
  if (summaries.length === 0) {
    return (
      <div>
        {/* Speech Agent Button */}
        <div className="flex justify-end mb-4">
          <RealtimeSpeechAgent meetings={fullMeetingsData} isActive={true} />
        </div>
        
        <div className="mt-6 card p-8 text-center">
          <p className="text-secondary-600 mb-2">No drug summaries found</p>
          <p className="text-secondary-500 text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  // Render summaries
  return (
    <div>
      {/* Speech Agent Button */}
      {/* <div className="flex justify-end mb-4">
        <RealtimeSpeechAgent meetings={fullMeetingsData} isActive={true} />
      </div> */}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {summaries.map(summary => (
          <SummaryCard key={summary.id} summary={summary} />
        ))}
      </div>
    </div>
  );
}