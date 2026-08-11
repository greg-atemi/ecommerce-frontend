import { useState, useEffect } from "react";
import { Tag } from "lucide-react";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { productApi } from "@/api/productApi";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";

export function SalePage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productApi.getAll()
      .then(({ data }) => {
        const onSale = data.content.filter((p) => p.compareAtPrice !== undefined);
        setSaleProducts(onSale);
      })
      .catch(() => setSaleProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Calculate max discount for the badge
  const maxDiscount = saleProducts.reduce((max, p) => {
    if (!p.compareAtPrice) return max;
    const discount = Math.round((1 - p.price / p.compareAtPrice) * 100);
    return discount > max ? discount : max;
  }, 0);

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-destructive" />
            <h1 className="text-3xl font-bold tracking-tight">Sale</h1>
            {maxDiscount > 0 && (
              <Badge variant="destructive" className="text-sm">
                Up to {maxDiscount}% off
              </Badge>
            )}
          </div>
          <p className="mt-2 text-muted-foreground">
            Limited stock — grab these before they're gone.
          </p>
        </div>
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {saleProducts.length} item{saleProducts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-muted animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : saleProducts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Tag className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No sale items at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}