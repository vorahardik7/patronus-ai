// src/components/home/SummaryFeed.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import SummaryCard from './SummaryCard';
import { Summary, FilterOptions, SortOrder } from '@/types';

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
    department: 'Cardiology',
    hospital: 'Metro General Hospital',
    keyPoints: [
      'Reduces blood pressure by 20% more effectively than leading competitors',
      'Minimal side effects in clinical trials',
      'Suitable for patients with diabetes',
      'Once-daily dosing for better compliance'
    ],
    relevantPatients: 45,
    additionalDoctors: ['Dr. Sarah Johnson', 'Dr. Robert Lee'],
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
    department: 'Neurology',
    hospital: 'Central Hospital',
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
    department: 'Pulmonology',
    hospital: 'Metro General Hospital',
    keyPoints: [
      'Improves lung function within 48 hours',
      'Reduces hospitalization rates by 35%',
      'Compatible with other respiratory medications',
      'New inhalation device improves drug delivery to lungs'
    ],
    relevantPatients: 38,
    additionalDoctors: ['Dr. Lisa Park'],
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
    department: 'Gastroenterology',
    hospital: 'University Hospital',
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
  const [loading, setLoading] = useState(true);

  // Use useCallback to memoize the filtering function
  const filterAndSortSummaries = useCallback(() => {
    let filteredSummaries = [...MOCK_SUMMARIES];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredSummaries = filteredSummaries.filter(summary => 
        summary.title.toLowerCase().includes(query) ||
        summary.drugName.toLowerCase().includes(query) ||
        summary.doctorName.toLowerCase().includes(query) ||
        summary.hospital.toLowerCase().includes(query) ||
        summary.department.toLowerCase().includes(query) ||
        summary.keyPoints.some(point => point.toLowerCase().includes(query)) ||
        summary.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply filters
    if (filters.hospital) {
      filteredSummaries = filteredSummaries.filter(summary => 
        summary.hospital.toLowerCase().includes(filters.hospital!.toLowerCase())
      );
    }
    
    if (filters.department) {
      filteredSummaries = filteredSummaries.filter(summary => 
        summary.department.toLowerCase() === filters.department!.toLowerCase()
      );
    }
    
    if (filters.drugName) {
      filteredSummaries = filteredSummaries.filter(summary => 
        summary.drugName.toLowerCase().includes(filters.drugName!.toLowerCase())
      );
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filteredSummaries = filteredSummaries.filter(summary => 
        filters.tags!.some(tag => summary.tags.includes(tag))
      );
    }
    
    // Apply sorting
    filteredSummaries.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        // 'relevance' - For demo, just sort by number of matching tags with filters
        const aRelevance = filters.tags ? 
          filters.tags.filter(tag => a.tags.includes(tag)).length : 0;
        const bRelevance = filters.tags ? 
          filters.tags.filter(tag => b.tags.includes(tag)).length : 0;
        return bRelevance - aRelevance;
      }
    });
    
    return filteredSummaries;
  }, [searchQuery, filters, sortOrder]);

  useEffect(() => {
    // Use a reference to prevent state updates after unmount
    let isMounted = true;
    
    // Set loading state
    setLoading(true);
    
    // Use a timer ID so we can clear it if needed
    const timerId = setTimeout(() => {
      if (isMounted) {
        // Get filtered and sorted summaries
        const filteredSummaries = filterAndSortSummaries();
        
        // Update state only if still mounted
        setSummaries(filteredSummaries);
        setLoading(false);
      }
    }, 500);
    
    // Cleanup function to prevent updates after unmount
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [filterAndSortSummaries]); // Only depend on the memoized function

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

  if (summaries.length === 0) {
    return (
      <div className="mt-6 card p-8 text-center">
        <p className="text-secondary-600 mb-2">No drug summaries found</p>
        <p className="text-secondary-500 text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {summaries.map(summary => (
        <SummaryCard key={summary.id} summary={summary} />
      ))}
    </div>
  );
}