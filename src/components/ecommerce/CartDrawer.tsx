import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, itemCount, subtotal } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            Cart{" "}
            {itemCount > 0 && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button variant="outline" size="sm" onClick={closeCart} asChild>
                <Link to="/products">Continue shopping</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium leading-tight">{product.name}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Qty stepper */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(product.id, quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border transition-colors hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums">{quantity}</span>
                      <button
                        onClick={() => updateQty(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="flex h-6 w-6 items-center justify-center rounded border transition-colors hover:bg-muted disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <Separator />
            <Button className="w-full" asChild onClick={closeCart}>
              <Link to="/checkout">Proceed to checkout</Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={closeCart} asChild>
              <Link to="/products">Continue shopping</Link>
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
