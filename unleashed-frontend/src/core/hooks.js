import { apiClient } from 'core/api';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';

export function useItems() {
  const [search] = useSearchParams({
    sort: 'name',
    minPrice: '0',
    maxPrice: '10000',
  });

  return useQuery(
    ['items', search.toString()],
    () =>
      apiClient
        .get('items', {
          params: search,
        })
        .then((res) => res.data),
    {
      staleTime: 120000,
    }
  );
}
