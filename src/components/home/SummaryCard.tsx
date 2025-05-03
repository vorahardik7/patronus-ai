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
import SummaryDetailModal from './SummaryDetailModal';

interface SummaryCardProps {
  summary: Summary;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-sm overflow-hidden border border-secondary-200 h-full flex flex-col hover:shadow-md transition-shadow duration-200 cursor-pointer"
        onClick={openModal}
      >
        <div className="p-5 flex-grow">
          {/* Header with title and date */}
          <div className="border-b border-secondary-100 pb-3 mb-4">
            <h2 className="text-xl font-semibold text-secondary-900 mb-1">
              {summary.title}
            </h2>
            <div className="flex items-center text-xs text-secondary-500 mt-1">
              <ClockIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              {format(new Date(summary.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
          
          {/* Key information section */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-secondary-600 bg-secondary-50 p-2 rounded">
              <BeakerIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
              <div>
                <div className="text-xs text-secondary-500">Drug</div>
                <div className="font-medium">{summary.drugName}</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-secondary-600 bg-secondary-50 p-2 rounded">
              <UserIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
              <div>
                <div className="text-xs text-secondary-500">Doctor</div>
                <div className="font-medium">{summary.doctorName}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary-50 p-3 rounded-lg">
            <h3 className="text-md font-medium text-secondary-900 mb-3 flex items-center">
              <span className="bg-primary-100 text-primary-700 rounded-full p-1 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
              Key Points
            </h3>
            <ul className="space-y-3">
              {summary.keyPoints.slice(0, expanded ? undefined : 2).map((point, index) => (
                <li key={index} className="flex items-start bg-white p-2 rounded border border-secondary-100">
                  <span className="flex-shrink-0 mr-2 mt-0.5 h-5 w-5 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm text-secondary-700">{point}</span>
                </li>
              ))}
            </ul>
            {summary.keyPoints.length > 2 && (
              <button
                onClick={toggleExpanded}
                className="flex items-center justify-center w-full text-primary-600 text-sm mt-3 hover:text-primary-700 transition-colors bg-white py-1.5 rounded-md border border-primary-100 hover:bg-primary-50"
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
            <div className="mt-4 mb-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-green-700">Potentially relevant for</div>
                <div className="font-semibold text-green-800 text-lg">{summary.relevantPatients} patients</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 pt-3 border-t border-secondary-100 mt-auto bg-secondary-50">
          <div className="text-xs text-secondary-500 mb-2">Tags</div>
          <div className="flex flex-wrap gap-2">
            {summary.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 bg-white border border-primary-100 text-primary-700 rounded-full text-xs font-medium shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <SummaryDetailModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        summary={summary}
      />
    </>
  );
}