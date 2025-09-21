
import { useState, useEffect, useCallback, useRef } from 'react';
import { UpcomingHeat } from '@/types/reminders';
import { useUpcomingHeatsContext } from '@/providers/UpcomingHeatsProvider';

export const useUpcomingHeats = () => {
  // Use the centralized provider instead of local state
  const { upcomingHeats, loading, refreshHeats } = useUpcomingHeatsContext();

  return { upcomingHeats, loading, refreshHeats };
};
