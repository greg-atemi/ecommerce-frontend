import { useState, useEffect, useCallback } from "react";
import { productApi, type ProductFilters, type ProductsPage } from "@/api/productApi";
import type { Product } from "@/types";

interface UseProductsResult {
  products: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  refresh: () => void;
}

export function useProducts(filters: ProductFilters): UseProductsResult {
  const [data, setData] = useState<ProductsPage | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0); // used by refresh()

  // Stringify filters so useEffect dependency comparison works correctly
  const filtersKey = JSON.stringify({ ...filters, page });

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    productApi
      .getAll({ ...filters, page })
      .then(({ data }) => {
        if (!cancelled) setData(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message ?? "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return {
    products: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: data?.number ?? 0,
    isLoading,
    error,
    setPage,
    refresh,
  };
}