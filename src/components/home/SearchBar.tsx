// src/components/home/SearchBar.tsx
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Auto-search after typing (debounce this in a real app)
    // For search terms of 3+ characters or empty searches
    if (newQuery.length >= 3 || newQuery.length === 0) {
      onSearch(newQuery);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value as SortOrder;
    setSortOrder(newSortOrder);
    onSortChange(newSortOrder);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
      <div className="flex-1 w-full">
        <form onSubmit={handleSubmit} className="flex">
          <div className="relative flex-grow flex">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-l-md border border-secondary-300 pl-10 pr-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Search by drug, doctor, hospital, or keywords..."
              value={query}
              onChange={handleQueryChange}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white font-medium rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>
      </div>
      
      <div className="flex items-center whitespace-nowrap">
        <label htmlFor="sort" className="text-sm font-medium text-secondary-700 mr-2">
          Sort by:
        </label>
        <select
          id="sort"
          className="rounded-md border border-secondary-300 py-1.5 pl-3 pr-7 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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