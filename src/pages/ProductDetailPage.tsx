import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, ChevronRight, Truck, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";           // keep formatPrice helper
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { ProductReviews } from "@/components/ecommerce/ProductReviews";
import { useProduct } from "@/hooks/useProduct";          // ← new
import { useProducts } from "@/hooks/useProducts";        // ← for related products

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, error } = useProduct(id ?? "");
  const { addItem, toggleCart } = useCart();

  const [mainImg, setMainImg] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);

  // Fetch related products from the same category
  const { products: related } = useProducts({
    category: product?.category ?? undefined,
    size: 4,
  });
  const relatedProducts = related.filter((p) => p.id !== product?.id);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-lg bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-24 rounded bg-muted animate-pulse" />
            <div className="h-10 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-8 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────────────────────
  if (error || !product) return <Navigate to="/products" replace />;

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addItem(product, qty, selectedVariants);
    toggleCart();
  };

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.images[mainImg]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-md border-2 transition-colors ${
                    mainImg === i ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <Badge variant="secondary">{product.category}</Badge>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <Badge variant="destructive">Save {discount}%</Badge>
              </>
            )}
          </div>

          <Separator />

          {/* Variants */}
          {product.variants?.map((variant) => (
            <div key={variant.id}>
              <p className="text-sm font-medium mb-2">
                {variant.name}
                {selectedVariants[variant.name] && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    — {selectedVariants[variant.name]}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))
                    }
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      selectedVariants[variant.name] === opt
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary hover:bg-accent"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Qty + CTA */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-muted transition-colors"
              >−</button>
              <span className="w-10 text-center tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-2 hover:bg-muted transition-colors"
              >+</button>
            </div>
            <Button className="flex-1 gap-2" onClick={handleAddToCart} disabled={product.stock === 0}>
              <ShoppingCart className="h-4 w-4" />
              {product.stock === 0 ? "Out of stock" : "Add to cart"}
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-sm text-amber-600 font-medium">
              ⚡ Only {product.stock} left in stock
            </p>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 rounded-lg border p-4">
            {[
              { icon: Truck, label: "Free shipping", sub: "Orders over KSh 5,000" },
              { icon: RefreshCw, label: "30-day returns", sub: "Hassle-free" },
              { icon: Shield, label: "2-year warranty", sub: "On all products" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({product.reviewCount})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4 prose max-w-none">
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <Accordion type="single" collapsible className="max-w-lg">
            {[
              { q: "Materials & care", a: "Please refer to the care label attached to the product for specific washing and care instructions." },
              { q: "Sizing & fit", a: "This product runs true to size. If you are between sizes, we recommend sizing up." },
              { q: "Shipping information", a: "Orders are processed within 1 business day and delivered in 2–4 business days across Kenya." },
            ].map(({ q, a }) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <ProductReviews
            productId={product.id}
            averageRating={product.rating}
            reviewCount={product.reviewCount}
          />
        </TabsContent>
      </Tabs>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight">You might also like</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}