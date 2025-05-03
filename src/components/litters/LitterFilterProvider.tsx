
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewType = 'grid' | 'list';

interface LitterFilterContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterYear: number | null;
  setFilterYear: (year: number | null) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  categoryTab: string;
  setCategoryTab: (tab: string) => void;
  activePage: number;
  setActivePage: (page: number) => void;
  archivedPage: number;
  setArchivedPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage?: (count: number) => void;
}

const LitterFilterContext = createContext<LitterFilterContextType | undefined>(undefined);

export const useLitterFilters = () => {
  const context = useContext(LitterFilterContext);
  if (!context) {
    throw new Error('useLitterFilters must be used within a LitterFilterProvider');
  }
  return context;
};

interface LitterFilterProviderProps {
  children: ReactNode;
}

export const LitterFilterProvider: React.FC<LitterFilterProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [view, setView] = useState<ViewType>('grid');
  const [categoryTab, setCategoryTab] = useState('active');
  const [activePage, setActivePage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Default to 6 items per page

  return (
    <LitterFilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filterYear,
        setFilterYear,
        view,
        setView,
        categoryTab,
        setCategoryTab,
        activePage,
        setActivePage,
        archivedPage,
        setArchivedPage,
        itemsPerPage,
        setItemsPerPage,
      }}
    >
      {children}
    </LitterFilterContext.Provider>
  );
};
