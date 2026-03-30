import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getProductById, formatPrice } from "@/data/products";

export function WishlistPage() {
  const { items, remove, clear } = useWishlist();
  const { addItem, toggleCart } = useCart();

  const wishlistProducts = items
    .map((item) => ({ item, product: getProductById(item.productId) }))
    .filter((entry): entry is { item: typeof items[0]; product: NonNullable<ReturnType<typeof getProductById>> } =>
      entry.product !== undefined
    );

  return (
    <div className="container py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
          {wishlistProducts.length > 0 && (
            <Badge variant="secondary">{wishlistProducts.length}</Badge>
          )}
        </div>
        {wishlistProducts.length > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clear}>
            Clear all
          </Button>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-20 text-center">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="font-medium">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Save items you love by clicking the heart icon on any product.
            </p>
          </div>
          <Button asChild>
            <Link to="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border divide-y">
          {wishlistProducts.map(({ item, product }) => {
            const discount = product.compareAtPrice
              ? Math.round((1 - product.price / product.compareAtPrice) * 100)
              : null;

            return (
              <div key={item.productId} className="flex gap-4 p-4">
                {/* Image */}
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-24 w-24 flex-shrink-0 rounded-md object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/products/${product.id}`}
                        className="font-medium hover:underline leading-tight"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="font-semibold">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                        {discount && (
                          <Badge variant="destructive" className="text-[10px]">
                            -{discount}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(item.productId)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={product.stock === 0}
                      onClick={() => {
                        addItem(product);
                        toggleCart();
                      }}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {product.stock === 0 ? "Out of stock" : "Add to cart"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Saved{" "}
                      {new Intl.DateTimeFormat("en-KE", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(item.addedAt))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer total */}
          <div className="p-4">
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {wishlistProducts.length} saved item{wishlistProducts.length !== 1 ? "s" : ""}
              </p>
              <Button
                onClick={() => {
                  wishlistProducts.forEach(({ product }) => addItem(product));
                  clear();
                  toggleCart();
                }}
              >
                Move all to cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
