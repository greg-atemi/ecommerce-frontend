import React, { createContext, useContext, useReducer, useMemo, useEffect } from "react";
import type { CartItem, Product } from "@/types";
import { useLocalStorage } from "@/hooks/use-local-storage";

// ─── State ────────────────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity?: number; selectedVariants?: Record<string, string> }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QTY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            product: action.product,
            quantity: action.quantity ?? 1,
            selectedVariants: action.selectedVariants,
          },
        ],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [persistedItems, setPersistedItems] = useLocalStorage<CartItem[]>("cart-items", []);
  const [state, dispatch] = useReducer(cartReducer, { items: persistedItems, isOpen: false });

  // Sync cart items back to localStorage whenever they change
  useEffect(() => {
    setPersistedItems(state.items);
  }, [state.items, setPersistedItems]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      isOpen: state.isOpen,
      itemCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      addItem: (product, quantity, selectedVariants) =>
        dispatch({ type: "ADD_ITEM", product, quantity, selectedVariants }),
      removeItem: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
      updateQty: (productId, quantity) => dispatch({ type: "UPDATE_QTY", productId, quantity }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
      closeCart: () => dispatch({ type: "CLOSE_CART" }),
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
