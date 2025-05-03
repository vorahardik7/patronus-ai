'use client';

import { useState } from 'react';
import SummaryFeed from '@/components/home/SummaryFeed';
import SearchBar from '@/components/home/SearchBar';
import FilterOptions from '@/components/home/FilterOptions';
import { FilterOptions as FilterOptionsType, SortOrder } from '@/types';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptionsType>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, you'd fetch data based on the query
  };

  const handleFilterChange = (newFilters: FilterOptionsType) => {
    setFilters(newFilters);
    // In a real app, you'd apply these filters to fetch filtered data
  };

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    // In a real app, you'd sort the data accordingly
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Recent Drug Summaries</h1>
        <p className="text-secondary-600">
          Browse and search through recent pharmaceutical presentations and discussions
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <FilterOptions onFilterChange={handleFilterChange} />
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <SearchBar onSearch={handleSearch} onSortChange={handleSortChange} />
          <SummaryFeed 
            searchQuery={searchQuery} 
            filters={filters} 
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </div>
  );
}