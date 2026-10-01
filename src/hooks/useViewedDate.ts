import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { localDate } from '@/lib/localDate';

const useDateSelection = create<{ selectedDate: string | null; selectDate: (date: string | null) => void }>(set => ({
  selectedDate: null,
  selectDate: selectedDate => set({ selectedDate }),
}));

export const useViewedDate = () => {
  const { selectedDate, selectDate } = useDateSelection();
  const [today, setToday] = useState(() => localDate());
  useEffect(() => {
    const refresh = () => setToday(localDate());
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return {
    currentDate: selectedDate ?? today,
    setCurrentDate: (date: string) => selectDate(date === localDate() ? null : date),
    isUpdating: false,
  };
};
