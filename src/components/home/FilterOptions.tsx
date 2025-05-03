// src/components/home/FilterOptions.tsx
import { useState, useEffect } from 'react';
import { FilterOptions as FilterOptionsType } from '@/types';
import { 
  FunnelIcon, 
  BuildingOfficeIcon, 
  BeakerIcon,
  AcademicCapIcon,
  TagIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Mock data for filters
const HOSPITALS = ['Metro General Hospital', 'Central Hospital', 'City Medical Center', 'University Hospital'];
const DEPARTMENTS = ['Cardiology', 'Neurology', 'Oncology', 'Pulmonology', 'Gastroenterology'];
const DRUG_NAMES = ['Cardiofix', 'NeuroCare', 'RespiClear', 'OncoShield', 'GastroEase'];
const TAGS = ['hypertension', 'cardiology', 'alzheimer\'s', 'neurology', 'COPD', 'respiratory'];

interface FilterOptionsProps {
  onFilterChange: (filters: FilterOptionsType) => void;
}

export default function FilterOptions({ onFilterChange }: FilterOptionsProps) {
  const [filters, setFilters] = useState<FilterOptionsType>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Update parent component when filters change
    onFilterChange({
      ...filters,
      tags: selectedTags
    });
  }, [filters, selectedTags, onFilterChange]);

  const handleInputChange = (key: keyof FilterOptionsType, value: string) => {
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters({
        ...filters,
        [key]: value
      });
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const resetFilters = () => {
    setFilters({});
    setSelectedTags([]);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="card">
      <div 
        className="p-4 border-b border-secondary-200 flex justify-between items-center cursor-pointer"
        onClick={toggleOpen}
      >
        <div className="flex items-center text-secondary-900 font-medium">
          <FunnelIcon className="h-5 w-5 text-secondary-600 mr-2" />
          Filters
        </div>
        <button className="text-secondary-500 hover:text-secondary-700">
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
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              Hospital
            </label>
            <select 
              className="input-field py-1.5"
              value={filters.hospital || ''}
              onChange={(e) => handleInputChange('hospital', e.target.value)}
            >
              <option value="">All Hospitals</option>
              {HOSPITALS.map(hospital => (
                <option key={hospital} value={hospital}>{hospital}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-secondary-700 mb-2">
              <AcademicCapIcon className="h-4 w-4 mr-1" />
              Department
            </label>
            <select 
              className="input-field py-1.5"
              value={filters.department || ''}
              onChange={(e) => handleInputChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(department => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-secondary-700 mb-2">
              <BeakerIcon className="h-4 w-4 mr-1" />
              Drug Name
            </label>
            <select 
              className="input-field py-1.5"
              value={filters.drugName || ''}
              onChange={(e) => handleInputChange('drugName', e.target.value)}
            >
              <option value="">All Drugs</option>
              {DRUG_NAMES.map(drug => (
                <option key={drug} value={drug}>{drug}</option>
              ))}
            </select>
          </div>
          
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
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
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
          
          <div className="pt-2">
            <button
              onClick={resetFilters}
              className="btn-secondary w-full flex justify-center items-center"
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