// src/components/home/SearchBar.tsx
import { useState } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { SortOrder } from '@/types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSortChange: (order: SortOrder) => void;
}

export default function SearchBar({ onSearch, onSortChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value as SortOrder;
    setSortOrder(newSortOrder);
    onSortChange(newSortOrder);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <form onSubmit={handleSubmit} className="flex-1 w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by drug, doctor, hospital, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 btn-primary rounded-l-none"
          >
            Search
          </button>
        </div>
      </form>
      
      <div className="flex items-center min-w-[200px]">
        <label htmlFor="sort" className="text-sm font-medium text-secondary-700 whitespace-nowrap mr-2">
          Sort by:
        </label>
        <select
          id="sort"
          className="input-field py-1"
          value={sortOrder}
          onChange={handleSortChange}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="relevance">Relevance</option>
        </select>
      </div>
    </div>
  );
}
