import { ShoppingCart, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/data/products";
import type { Product } from "@/types";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [imgIdx, setImgIdx] = useState(0);

  const wishlisted = isWishlisted(product.id);

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      {/* Image */}
      <Link to={`/products/${product.id}`}>
        <div
          className="relative aspect-square overflow-hidden bg-muted"
          onMouseEnter={() => product.images[1] && setImgIdx(1)}
          onMouseLeave={() => setImgIdx(0)}
        >
          <img
            src={product.images[imgIdx]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {discount && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              -{discount}%
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="secondary" className="absolute left-2 top-8">
              Only {product.stock} left
            </Badge>
          )}
        </div>
      </Link>

      {/* Wishlist */}
      <button
        onClick={() => toggle(product.id)}
        className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-white"
        aria-label="Toggle wishlist"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
          }`}
        />
      </button>

      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.category}
        </p>
        <Link to={`/products/${product.id}`}>
          <h3 className="mt-1 font-medium leading-tight hover:underline">{product.name}</h3>
        </Link>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
