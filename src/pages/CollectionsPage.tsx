import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { products } from "@/data/products";

interface Collection {
  slug: string;
  title: string;
  description: string;
  category: string;
  tag?: string;
  /** Unsplash cover image */
  cover: string;
}

const COLLECTIONS: Collection[] = [
  {
    slug: "footwear",
    title: "Footwear",
    description: "Shoes built to go the distance — from the office to the outdoors.",
    category: "Footwear",
    cover: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  },
  {
    slug: "tops",
    title: "Tops",
    description: "Knitwear, shirts, and layering pieces made to last for years.",
    category: "Tops",
    tag: "New season",
    cover: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
  },
  {
    slug: "bags",
    title: "Bags",
    description: "Carry what matters — waxed canvas, full-grain leather, and more.",
    category: "Bags",
    cover: "https://images.unsplash.com/photo-1594938298603-c8148c4b4a8a?w=800",
  },
  {
    slug: "bottoms",
    title: "Bottoms",
    description: "Chinos, trousers, and shorts that move with your day.",
    category: "Bottoms",
    tag: "Sale",
    cover: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
  },
];

export function CollectionsPage() {
  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-10 max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <p className="mt-2 text-muted-foreground">
          Shop by category — each collection is curated around a specific way of living.
        </p>
      </div>

      {/* Grid — first card is hero-sized */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((col, i) => {
          const count = products.filter((p) => p.category === col.category).length;

          return (
            <Link
              key={col.slug}
              to={`/products?category=${encodeURIComponent(col.category)}`}
              className={`group relative overflow-hidden rounded-2xl bg-muted ${
                i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""
              }`}
            >
              {/* Cover image */}
              <div
                className={`relative ${
                  i === 0 ? "aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[480px]" : "aspect-[4/3]"
                } overflow-hidden`}
              >
                <img
                  src={col.cover}
                  alt={col.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {col.tag && (
                      <Badge
                        variant="secondary"
                        className="mb-2 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                      >
                        {col.tag}
                      </Badge>
                    )}
                    <h2 className="text-xl font-bold leading-tight">{col.title}</h2>
                    <p className="mt-1 text-sm text-white/80 line-clamp-2">{col.description}</p>
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
    </div>
  );
}
