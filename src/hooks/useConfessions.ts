import { useState, useCallback } from 'react';
import { confessionService } from '../services/api';
import { SearchFilters, ConfessionFormData, PaginationData } from '../types';

export const useConfessions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfessions = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      filters: SearchFilters
    ): Promise<PaginationData> => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = { page, limit };
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== undefined && value !== null) {
            params[key] = value;
          }
        });

        const data = await confessionService.getConfessions(params);
        return data;
      } catch (err) {
        setError('Failed to fetch confessions');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createConfession = useCallback(
    async (data: FormData | ConfessionFormData) => {
      setLoading(true);
      setError(null);
      try {
        await confessionService.createConfession(data);
      } catch (err) {
        setError('Failed to submit confession');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchConfessions, createConfession, loading, error };
};
