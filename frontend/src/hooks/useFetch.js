import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook thực hiện fetch dữ liệu qua Promise
 */
export const useFetch = (fetchFunction, autoFetch = true, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction(...args);
      setData(response?.data || response);
      return response;
    } catch (err) {
      setError(err?.message || 'Lỗi khi tải dữ liệu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, execute, setData };
};
