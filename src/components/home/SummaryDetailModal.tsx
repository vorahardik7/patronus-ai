// src/components/home/SummaryDetailModal.tsx
import { Summary } from '@/types';
import Modal from '@/components/common/Modal';
import ResearchLinks from './ResearchLinks';
import { format } from 'date-fns';
import { 
  ClockIcon, 
  UserIcon, 
  BeakerIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface SummaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: Summary | null;
}

export default function SummaryDetailModal({ isOpen, onClose, summary }: SummaryDetailModalProps) {
  if (!summary) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={summary.title}
    >
      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-secondary-200">
          <div className="flex items-center text-sm text-secondary-600">
            <BeakerIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
            <span className="font-medium mr-1">Drug:</span> {summary.drugName}
          </div>
          <div className="flex items-center text-sm text-secondary-600">
            <UserIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
            <span className="font-medium mr-1">Doctor:</span> {summary.doctorName}
          </div>
          <div className="flex items-center text-sm text-secondary-600">
            <UserCircleIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
            <span className="font-medium mr-1">Presenter:</span> {summary.presenter}
          </div>
          <div className="flex items-center text-sm text-secondary-600">
            <ClockIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
            <span className="font-medium mr-1">Created:</span> {format(new Date(summary.createdAt), 'MMMM d, yyyy')}
          </div>
          {summary.updatedAt !== summary.createdAt && (
            <div className="flex items-center text-sm text-secondary-600">
              <ClockIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
              <span className="font-medium mr-1">Updated:</span> {format(new Date(summary.updatedAt), 'MMMM d, yyyy')}
            </div>
          )}
        </div>

        {/* Key Points Section */}
        <div className="pb-6 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Key Points</h3>
          <ul className="space-y-3">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 mr-3 mt-1 h-5 w-5 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-secondary-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Research Links Section */}
        <ResearchLinks tags={summary.tags} />

        {/* Relevant Patients Section */}
        {summary.relevantPatients && (
          <div className="pb-6 border-b border-secondary-200">
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Patient Relevance</h3>
            <p className="text-secondary-700">
              This drug presentation is potentially relevant for <span className="font-medium text-primary-700">{summary.relevantPatients}</span> patients currently in the system.
            </p>
          </div>
        )}

        {/* Tags Section */}
        <div>
          <h3 className="text-lg font-medium text-secondary-900 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {summary.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 mt-6">
          <button className="btn-secondary">
            Download PDF
          </button>
          <button className="btn-primary">
            Share with Team
          </button>
        </div>
      </div>
    </Modal>
  );
}