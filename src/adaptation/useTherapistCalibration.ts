import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TherapistCalibrationData {
  therapist_name: string;
  calibration_profile: Record<string, any>;
  voice_clone_url: string | null;
  created_at: string;
}

/**
 * Fetches the latest therapist calibration and voice clone data from Supabase.
 * By default, fetches the most recent entry (gold standard) for all games to use.
 * Optionally filter by therapist_name if needed.
 */
export function useTherapistCalibration(therapistName?: string) {
  const [data, setData] = useState<TherapistCalibrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCalibration() {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('calibration_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (therapistName) {
        query = query.eq('therapist_name', therapistName);
      }
      const { data, error } = await query;
      if (!isMounted) return;
      if (error) {
        setError(error.message);
        setData(null);
      } else if (data && data.length > 0) {
        setData(data[0] as TherapistCalibrationData);
      } else {
        setData(null);
      }
      setLoading(false);
    }
    fetchCalibration();
    return () => { isMounted = false; };
  }, [therapistName]);

  return { data, loading, error };
}
