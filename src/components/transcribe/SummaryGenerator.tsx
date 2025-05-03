// src/components/transcribe/SummaryGenerator.tsx
import { useState, useEffect } from 'react';
import { TranscriptSegment } from '@/types';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  PencilSquareIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  TagIcon,
  BeakerIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface SummaryGeneratorProps {
  transcript: TranscriptSegment[];
  summary: string;
  onGenerateSummary: () => void;
}

export default function SummaryGenerator({
  transcript,
  summary,
  onGenerateSummary
}: SummaryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedSummary, setEditedSummary] = useState(summary);
  const [drugName, setDrugName] = useState('');
  const [hospital, setHospital] = useState('');
  const [department, setDepartment] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Update editedSummary when summary prop changes
  useEffect(() => {
    setEditedSummary(summary);
  }, [summary]);

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    onGenerateSummary();
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  const handleSave = () => {
    // In a real app, this would save to a database
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handleStartEdit = () => {
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    // In a real app, this would update the summary
    setEditMode(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prevTags => [...prevTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  };

  // Prevent default on enter key in tag input to avoid form submission
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-secondary-200 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg text-secondary-900">Summary</h2>
          <p className="text-sm text-secondary-600">
            Generate and edit the conversation summary
          </p>
        </div>
        
        {!editMode && !isGenerating && (
          <div className="flex space-x-2">
            {summary && (
              <button
                onClick={handleStartEdit}
                className="btn-secondary flex items-center p-2"
              >
                <PencilSquareIcon className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={handleGenerateSummary}
              className="btn-primary flex items-center"
              disabled={transcript.length === 0}
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              {summary ? 'Regenerate' : 'Generate Summary'}
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-secondary-700">Generating summary...</p>
          </div>
        ) : summary === '' && !editMode ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600">
              Click the "Generate Summary" button to create a summary from the transcript
            </p>
          </div>
        ) : editMode ? (
          <div>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="drug-name" className="block text-sm font-medium text-secondary-700 mb-1">
                  Drug Name
                </label>
                <div className="flex items-center">
                  <BeakerIcon className="h-5 w-5 text-secondary-500 mr-2" />
                  <input
                    id="drug-name"
                    type="text"
                    className="input-field"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="e.g. Cardiofix"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hospital" className="block text-sm font-medium text-secondary-700 mb-1">
                    Hospital
                  </label>
                  <input
                    id="hospital"
                    type="text"
                    className="input-field"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="e.g. Metro General Hospital"
                  />
                </div>
                
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-secondary-700 mb-1">
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    className="input-field"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Cardiology"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="doctor-name" className="block text-sm font-medium text-secondary-700 mb-1">
                  Doctor Name
                </label>
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-secondary-500 mr-2" />
                  <input
                    id="doctor-name"
                    type="text"
                    className="input-field"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Smith"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="summary-text" className="block text-sm font-medium text-secondary-700 mb-1">
                  Summary
                </label>
                <textarea
                  id="summary-text"
                  className="input-field min-h-[200px]"
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="tag flex items-center"
                    >
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <div className="flex items-center w-full">
                    <TagIcon className="h-5 w-5 text-secondary-500 mr-2" />
                    <input
                      type="text"
                      className="input-field"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag and press Enter"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditMode(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-secondary-800 p-4 bg-secondary-50 rounded-md border border-secondary-200">
                {summary}
              </pre>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                className="btn-primary flex items-center"
                disabled={isSaved}
              >
                {isSaved ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Save Summary
                  </>
                )}
              </button>
              
              <button className="btn-outline flex items-center">
                <ShareIcon className="h-5 w-5 mr-2" />
                Share with Team
              </button>
              
              <button className="btn-secondary flex items-center">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}