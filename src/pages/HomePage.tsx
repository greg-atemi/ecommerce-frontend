import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { productApi, type Category } from "@/api/productApi";
import type { Product } from "@/types";

export function HomePage() {
  const [featured, setFeatured]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productApi.getAll({ size: 4 })
      .then(({ data }) => setFeatured(data.content.slice(0, 4)))
      .catch(() => setFeatured([]));

    productApi.getCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        <div className="container py-20">
          <p className="text-sm font-medium uppercase tracking-widest text-slate-400">
            New Season — 2026
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Crafted for the Considered Life.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-300">
            Goods made with intention, built to last. Shop essentials that earn their place in your routine.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link to="/products">Shop now</Link>
            </Button>
            <Button size="lg" variant="alternative" className="border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
              <Link to="/collections">View collections</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold tracking-tight">Shop by category</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[2/1] rounded-lg bg-muted animate-pulse" />
            ))
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.name}`}
                className="group relative flex aspect-[2/1] items-end overflow-hidden rounded-lg"
              >
                {/* Background image */}
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 h-full w-full bg-muted" />
                )}

                {/* Gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Content */}
                <div className="relative p-4 text-white">
                  <p className="font-semibold">{cat.name}</p>
                  <p className="flex items-center gap-1 text-sm text-white/80 transition-colors group-hover:text-white">
                    Shop <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="container pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured products</h2>
          <Button variant="ghost" asChild>
            <Link to="/products" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-muted animate-pulse aspect-[3/4]" />
            ))
          ) : (
            featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="bg-primary text-primary-foreground">
        <div className="container flex flex-col items-center gap-4 py-16 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-2xl font-bold">Free shipping on orders over KSh 5,000</h2>
            <p className="mt-1 text-primary-foreground/80">Delivered in 2–4 business days, Kenya-wide.</p>
          </div>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/products">Start shopping</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}