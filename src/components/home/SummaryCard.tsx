// src/components/home/SummaryCard.tsx
import { useState } from 'react';
import { Summary } from '@/types';
import { 
  ClockIcon, 
  UserIcon, 
  BeakerIcon, 
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface SummaryCardProps {
  summary: Summary;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-secondary-200 h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-secondary-900 mb-3">
            {summary.title}
          </h2>
          <div className="flex items-center text-xs text-secondary-500">
            <ClockIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            {format(new Date(summary.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-secondary-600">
            <BeakerIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
            <span className="font-medium mr-1">Drug:</span> {summary.drugName}
          </div>
          <div className="flex items-center text-sm text-secondary-600">
            <UserIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
            <span className="font-medium mr-1">Doctor:</span> {summary.doctorName}
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium text-secondary-900 mb-2">Key Points:</h3>
          <ul className="space-y-2">
            {summary.keyPoints.slice(0, expanded ? undefined : 2).map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 mr-2 mt-1 h-4 w-4 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm text-secondary-700">{point}</span>
              </li>
            ))}
          </ul>
          {summary.keyPoints.length > 2 && (
            <button
              onClick={toggleExpanded}
              className="flex items-center text-primary-600 text-sm mt-3 hover:text-primary-700 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                  Show more ({summary.keyPoints.length - 2} more points)
                </>
              )}
            </button>
          )}
        </div>
        
        {summary.relevantPatients && (
          <div className="mt-4 mb-6 text-sm text-secondary-600">
            <span className="font-medium">Potentially relevant for:</span> {summary.relevantPatients} patients
          </div>
        )}
      </div>
      
      <div className="p-4 pt-2 border-t border-secondary-100 mt-auto">
        <div className="flex flex-wrap gap-2">
          {summary.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}