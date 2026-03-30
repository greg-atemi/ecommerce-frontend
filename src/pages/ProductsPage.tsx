import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { products } from "@/data/products";

const CATEGORIES = ["Footwear", "Tops", "Bags", "Bottoms"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
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

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    list = list.filter(
      (p) => p.price / 100 >= priceRange[0] && p.price / 100 <= priceRange[1]
    );

    switch (sort) {
      case "price-asc":  return list.sort((a, b) => a.price - b.price);
      case "price-desc": return list.sort((a, b) => b.price - a.price);
      case "rating":     return list.sort((a, b) => b.rating - a.rating);
      default:           return list;
    }
  }, [searchQuery, selectedCategories, priceRange, sort]);

  const activeFilterCount = selectedCategories.length + (priceRange[1] < 20000 ? 1 : 0);

  return (
    <div className="container py-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
          </h1>
          <p className="text-sm text-muted-foreground">{filtered.length} products</p>
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

      <div className="mt-6 flex gap-8">
        {/* Sidebar filters */}
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
                  min={0}
                  max={20000}
                  step={500}
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
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground gap-2"
              onClick={() => { setSelectedCategories([]); setPriceRange([0, 20000]); }}
            >
              <X className="h-4 w-4" /> Clear all filters
            </Button>
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <p className="text-muted-foreground">No products match your filters.</p>
              <Button variant="outline" onClick={() => { setSelectedCategories([]); setPriceRange([0, 20000]); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
