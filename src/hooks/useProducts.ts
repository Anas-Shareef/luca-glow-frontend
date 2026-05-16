import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, CategoryDef } from '@/data/products';

export type StorefrontData = {
  products: Product[];
  categories: CategoryDef[];
  sliders: any[];
};

export const useStorefrontData = () => {
  return useQuery({
    queryKey: ['storefront-data'],
    queryFn: async () => {
      const { data } = await api.get<StorefrontData>('/storefront/data');
      return data;
    },
    staleTime: 0, // Set to 0 for immediate updates when admin changes data
  });
};

export const useProducts = () => {
  const { data, ...rest } = useStorefrontData();
  return { products: data?.products || [], ...rest };
};

export const useCategories = () => {
  const { data, ...rest } = useStorefrontData();
  return { categories: data?.categories || [], ...rest };
};

export const useSliders = () => {
  const { data, ...rest } = useStorefrontData();
  return { sliders: data?.sliders || [], ...rest };
};