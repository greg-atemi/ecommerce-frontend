import { useState, useEffect } from "react";
import { productApi } from "@/api/productApi";
import type { Product } from "@/types";

interface UseProductResult {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

export function useProduct(id: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    productApi
      .getById(id)
      .then(({ data }) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message ?? "Product not found");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { product, isLoading, error };
}