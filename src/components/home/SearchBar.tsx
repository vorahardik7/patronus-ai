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
    <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
      <form onSubmit={handleSubmit} className="flex-1 w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-secondary-300 pl-10 pr-20 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Search by drug, doctor, hospital, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center px-4 bg-primary-600 text-white font-medium rounded-r-md hover:bg-primary-700"
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
          className="block w-full rounded-md border-secondary-300 py-1.5 pl-3 pr-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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