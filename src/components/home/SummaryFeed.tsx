// src/components/home/SummaryFeed.tsx
'use client';

import { useEffect, useState } from 'react';
import SummaryCard from './SummaryCard';
import { Summary, meetingToSummary } from '@/types';
import { getAllMeetings } from '@/services/meetingService';

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
    presenter: 'Sarah Johnson',
    doctorName: 'Dr. Robert Kim',
    keyPoints: [
      'Improves lung function by 30% in moderate to severe COPD',
      'Reduces exacerbations by 40%',
      'Once-daily inhaler with easy-to-use design',
      'Compatible with existing COPD medications'
    ],
    relevantPatients: 67,
    tags: ['copd', 'respiratory', 'pulmonology']
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

export default function SummaryFeed() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch initial data on component mount
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const meetings = await getAllMeetings();
        
        // Convert real data to Summary format
        const convertedSummaries = meetings.map((meeting) => meetingToSummary(meeting));
        
        // Combine real data with mock data for demo purposes
        const allSummaries = [...convertedSummaries, ...MOCK_SUMMARIES];
        setSummaries(allSummaries);
        
        console.log(`Loaded ${meetings.length} real meetings and ${MOCK_SUMMARIES.length} mock meetings`);
      } catch (err) {
        console.error('Error fetching initial meetings:', err);
        setError('Failed to load meetings. Using mock data instead.');
        setSummaries([...MOCK_SUMMARIES]);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // Render loading state
  if (loading && !summaries.length) {
    return (
      <div className="space-y-6">        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
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
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="mt-6 card p-6 border-red-300 bg-red-50">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Render summaries
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {summaries.map(summary => (
          <SummaryCard key={summary.id} summary={summary} />
        ))}
      </div>
    </div>
  );
}