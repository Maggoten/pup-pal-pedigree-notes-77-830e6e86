
import React, { createContext, useContext, useState } from 'react';
import { Litter } from '@/types/breeding';

export type ViewType = 'grid' | 'list';
export type ListDisplayMode = 'compact' | 'detailed';

export interface LitterFilterContext {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  displayMode: ListDisplayMode;
  setDisplayMode: (mode: ListDisplayMode) => void;
  activePage: number;
  setActivePage: (page: number) => void;
  archivedPage: number;
  setArchivedPage: (page: number) => void;
  itemsPerPage: number;
}

const defaultContext: LitterFilterContext = {
  searchQuery: '',
  setSearchQuery: () => {},
  selectedYear: null,
  setSelectedYear: () => {},
  view: 'grid',
  setView: () => {},
  displayMode: 'compact',
  setDisplayMode: () => {},
  activePage: 1,
  setActivePage: () => {},
  archivedPage: 1,
  setArchivedPage: () => {},
  itemsPerPage: 12,
};

const FilterContext = createContext<LitterFilterContext>(defaultContext);

export const useLitterFilter = () => useContext(FilterContext);

export const LitterFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [view, setView] = useState<ViewType>('grid');
  const [displayMode, setDisplayMode] = useState<ListDisplayMode>('compact');
  const [activePage, setActivePage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const itemsPerPage = 12;

  const contextValue = {
    searchQuery,
    setSearchQuery,
    selectedYear,
    setSelectedYear,
    view,
    setView,
    displayMode,
    setDisplayMode,
    activePage,
    setActivePage,
    archivedPage,
    setArchivedPage,
    itemsPerPage,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
