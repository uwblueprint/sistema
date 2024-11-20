import { useCallback, useState, useEffect } from 'react';
import { Absence, FetchAbsenceResponse } from '../../types/absence';

export const useFetchAbsences = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);

  const fetchAbsences = useCallback(async () => {
    try {
      const res = await fetch('/api/absence');
      const data: FetchAbsenceResponse = await res.json();

      setAbsences(
        data.absences.map((absence) => ({
          ...absence,
          lessonDate: new Date(absence.lessonDate), // Convert lessonDate to Date object
        }))
      );
    } catch (error) {
      console.error('Failed to fetch absences:', error);
    }
  }, []);

  // Automatically fetch absences when the component mounts
  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  return absences;
};
