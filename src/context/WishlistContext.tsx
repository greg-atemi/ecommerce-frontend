import React, { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { WishlistItem } from "@/types";

interface WishlistContextValue {
  items: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useLocalStorage<WishlistItem[]>("wishlist-items", []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      isWishlisted: (productId) => items.some((i) => i.productId === productId),
      toggle: (productId) => {
        setItems((prev) => {
          const exists = prev.some((i) => i.productId === productId);
          return exists
            ? prev.filter((i) => i.productId !== productId)
            : [...prev, { productId, addedAt: new Date().toISOString() }];
        });
      },
      remove: (productId) =>
        setItems((prev) => prev.filter((i) => i.productId !== productId)),
      clear: () => setItems([]),
    }),
    [items, setItems]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within <WishlistProvider>");
  return ctx;
}
