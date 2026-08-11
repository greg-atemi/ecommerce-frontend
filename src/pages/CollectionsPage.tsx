import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { productApi, type Category } from "@/api/productApi";

// ── Static metadata keyed by category name ────────────────────────────────────
// When a live category matches a key here, it gets the richer display data.
// Unrecognised categories fall back to sensible defaults.
const CATEGORY_META: Record<string, {
  description: string;
  cover: string;
  tag?: string;
}> = {
  Footwear: {
    description: "Shoes built to go the distance — from the office to the outdoors.",
    cover: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  },
  Tops: {
    description: "Knitwear, shirts, and layering pieces made to last for years.",
    cover: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
    tag: "New season",
  },
  Bags: {
    description: "Carry what matters — waxed canvas, full-grain leather, and more.",
    cover: "https://images.unsplash.com/photo-1594938298603-c8148c4b4a8a?w=800",
  },
  Bottoms: {
    description: "Chinos, trousers, and shorts that move with your day.",
    cover: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
    tag: "Sale",
  },
};

const FALLBACK_META = {
  description: "Browse our curated selection.",
  cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
};

export function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.getCategories(),
      productApi.getAll(),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);

        // Count products per category name
        const counts: Record<string, number> = {};
        for (const product of prodRes.data.content) {
          const cat = product.category ?? "Uncategorised";
          counts[cat] = (counts[cat] ?? 0) + 1;
        }
        setProductCounts(counts);
      })
      .catch(() => {
        setCategories([]);
        setProductCounts({});
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-10 max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <p className="mt-2 text-muted-foreground">
          Shop by category — each collection is curated around a specific way of living.
        </p>
      </div>

      {/* Loading skeletons */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl bg-muted animate-pulse ${
                i === 0 ? "aspect-[4/3] sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:min-h-[480px]" : "aspect-[4/3]"
              }`}
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground">No collections found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const meta = CATEGORY_META[cat.name] ?? FALLBACK_META;
            const count = productCounts[cat.name] ?? 0;

            return (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`group relative overflow-hidden rounded-2xl bg-muted ${
                  i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""
                }`}
              >
                {/* Cover image */}
                <div
                  className={`relative ${
                    i === 0
                      ? "aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[480px]"
                      : "aspect-[4/3]"
                  } overflow-hidden`}
                >
                  <img
                    src={meta.cover}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {meta.tag && (
                        <Badge
                          variant="secondary"
                          className="mb-2 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                        >
                          {meta.tag}
                        </Badge>
                      )}
                      <h2 className="text-xl font-bold leading-tight">{cat.name}</h2>
                      <p className="mt-1 text-sm text-white/80 line-clamp-2">{meta.description}</p>
                      <p className="mt-2 text-xs text-white/60">
                        {count} product{count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-black">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}