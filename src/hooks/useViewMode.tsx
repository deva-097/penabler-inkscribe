import { useState, useEffect } from 'react';

export type ViewMode = 'card' | 'list';

interface UseViewModeProps {
  storageKey: string;
  defaultView?: ViewMode;
}

export const useViewMode = ({ storageKey, defaultView = 'card' }: UseViewModeProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(storageKey);
    return (stored as ViewMode) || defaultView;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, viewMode);
  }, [viewMode, storageKey]);

  return { viewMode, setViewMode };
};