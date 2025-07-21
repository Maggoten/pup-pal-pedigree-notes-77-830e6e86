
import React, { createContext, useContext, useState } from 'react';
import { Litter } from '@/types/breeding';

export type ViewType = 'grid' | 'list';
export type ListDisplayMode = 'compact' | 'detailed';
export type StatusFilter = 'all' | 'active' | 'archived';

export interface LitterFilterContext {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  displayMode: ListDisplayMode;
  setDisplayMode: (mode: ListDisplayMode) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const defaultContext: LitterFilterContext = {
  searchQuery: '',
  setSearchQuery: () => {},
  selectedYear: null,
  setSelectedYear: () => {},
  statusFilter: 'all',
  setStatusFilter: () => {},
  view: 'grid',
  setView: () => {},
  displayMode: 'compact',
  setDisplayMode: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  itemsPerPage: 12,
};

const FilterContext = createContext<LitterFilterContext>(defaultContext);

export const useLitterFilter = () => useContext(FilterContext);

export const LitterFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [view, setView] = useState<ViewType>('grid');
  const [displayMode, setDisplayMode] = useState<ListDisplayMode>('compact');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const contextValue = {
    searchQuery,
    setSearchQuery,
    selectedYear,
    setSelectedYear,
    statusFilter,
    setStatusFilter,
    view,
    setView,
    displayMode,
    setDisplayMode,
    currentPage,
    setCurrentPage,
    itemsPerPage,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
