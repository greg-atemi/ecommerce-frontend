import { useEffect, useState } from "react";

export interface Review {
  id: string | number;
  author: string;      // adjust to your DTO (e.g. userName)
  rating: number;
  comment: string;
  createdAt: string;
}

export function useReviews(productId: string | number) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    setIsLoading(true);

    fetch(`/api/products/${productId}/reviews`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setReviews(Array.isArray(data) ? data : data.content ?? []))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [productId]);

  return { reviews, isLoading, error };
}