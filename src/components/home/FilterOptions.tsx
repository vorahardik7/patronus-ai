// src/components/home/FilterOptions.tsx
import { useState, useEffect, useCallback } from 'react';
import { FilterOptions as FilterOptionsType } from '@/types';
import { 
  FunnelIcon, 
  TagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Mock data for filters - in a real application, you would fetch these from the database
const TAGS = ['hypertension', 'cardiology', 'alzheimer\'s', 'neurology', 'COPD', 'respiratory'];

interface FilterOptionsProps {
  onFilterChange: (filters: FilterOptionsType) => void;
}

export default function FilterOptions({ onFilterChange }: FilterOptionsProps) {
  const [filters, setFilters] = useState<FilterOptionsType>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  
  // Skip the first render to avoid unnecessary updates
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }
    
    console.log('Filter options updated:', { ...filters, tags: selectedTags });
    
    const combinedFilters = {
      ...filters,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    };
    
    onFilterChange(combinedFilters);
  }, [filters, selectedTags, onFilterChange, isInitialRender]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tag)) {
        console.log(`Removing tag filter: ${tag}`);
        return prevTags.filter(t => t !== tag);
      } else {
        console.log(`Adding tag filter: ${tag}`);
        return [...prevTags, tag];
      }
    });
  }, []);

  const resetFilters = useCallback(() => {
    console.log('Resetting all filters');
    setFilters({});
    setSelectedTags([]);
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
      <div 
        className="p-4 bg-white border-b border-secondary-200 flex justify-between items-center cursor-pointer"
        onClick={toggleOpen}
      >
        <div className="flex items-center text-secondary-900 font-medium">
          <FunnelIcon className="h-5 w-5 text-secondary-600 mr-2" />
          Filters {selectedTags.length > 0 && `(${selectedTags.length})`}
        </div>
        <button className="text-secondary-500 hover:text-secondary-700 cursor-pointer">
          {isOpen ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <FunnelIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {isOpen && (
        <div className="p-4 space-y-5">
          <div>
            <label className="flex items-center text-sm font-medium text-secondary-700 mb-2">
              <TagIcon className="h-4 w-4 mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {/* Additional filters could be added here */}
          
          <div className="pt-2">
            <button
              onClick={resetFilters}
              className="w-full flex justify-center items-center py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed"
              disabled={Object.keys(filters).length === 0 && selectedTags.length === 0}
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}