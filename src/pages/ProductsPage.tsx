import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { useProducts } from "@/hooks/useProducts"; // ← replaces static import

const CATEGORIES = ["Footwear", "Tops", "Bags", "Bottoms"];
const SORT_OPTIONS = [
  { value: "featured",   label: "Featured" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating",     label: "Best Rated" },
];

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [sort, setSort] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get("search") ?? "";

  // ── Send filters to the backend instead of filtering client-side ──────────
  const { products, totalElements, isLoading, error, refresh } = useProducts({
    search:    searchQuery   || undefined,
    category:  selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    minPrice:  priceRange[0] > 0      ? priceRange[0] : undefined,
    maxPrice:  priceRange[1] < 20000  ? priceRange[1] : undefined,
    sort,
    size: 24,
  });

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const activeFilterCount =
    selectedCategories.length + (priceRange[1] < 20000 ? 1 : 0);

  return (
    <div className="container py-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${totalElements} products`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((f) => !f)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={refresh}>Retry</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 flex gap-8">
        {/* Sidebar — unchanged */}
        {showFilters && (
          <aside className="w-56 flex-shrink-0 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Category</h3>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {CATEGORIES.map((cat) => (
                  <div key={cat} className="flex items-center gap-2">
                    <Checkbox
                      id={cat}
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <Label htmlFor={cat} className="cursor-pointer font-normal">{cat}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold">Price range</h3>
              <div className="mt-3">
                <Slider
                  min={0} max={20000} step={500}
                  value={priceRange}
                  onValueChange={(val) => setPriceRange(val as [number, number])}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>KSh {priceRange[0].toLocaleString()}</span>
                  <span>KSh {priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Separator />
            <Button
              variant="ghost" size="sm"
              className="w-full text-muted-foreground gap-2"
              onClick={() => { setSelectedCategories([]); setPriceRange([0, 20000]); }}
            >
              <X className="h-4 w-4" /> Clear all filters
            </Button>
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            // Skeleton shimmer while loading
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-muted animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <p className="text-muted-foreground">No products match your filters.</p>
              <Button
                variant="outline"
                onClick={() => { setSelectedCategories([]); setPriceRange([0, 20000]); }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}