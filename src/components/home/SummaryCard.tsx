// src/components/home/SummaryCard.tsx (continued)
import { useState } from 'react';
import { Summary } from '@/types';
import { 
  ClockIcon, 
  UserIcon, 
  BuildingOfficeIcon, 
  BeakerIcon, 
  UserGroupIcon,
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
    <div className="card overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            {summary.title}
          </h2>
          <div className="flex items-center text-xs text-secondary-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            {format(new Date(summary.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="flex items-center text-sm text-secondary-600">
            <BeakerIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span className="font-medium mr-1">Drug:</span> {summary.drugName}
          </div>
          <div className="flex items-center text-sm text-secondary-600">
            <UserIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span className="font-medium mr-1">Doctor:</span> {summary.doctorName}
          </div>
          <div className="flex items-center text-sm text-secondary-600">
            <BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-500" />
            <span className="font-medium mr-1">Hospital:</span> {summary.hospital}
          </div>
        </div>
        
        <div className="mt-4">
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
        
        {expanded && summary.additionalDoctors && summary.additionalDoctors.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center text-sm text-secondary-600">
              <UserGroupIcon className="h-5 w-5 mr-2 text-primary-500" />
              <span className="font-medium mr-1">Also relevant for:</span>
              {summary.additionalDoctors.join(', ')}
            </div>
          </div>
        )}
        
        {summary.relevantPatients && (
          <div className="mt-4 text-sm text-secondary-600">
            <span className="font-medium">Potentially relevant for:</span> {summary.relevantPatients} patients
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2">
          {summary.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
