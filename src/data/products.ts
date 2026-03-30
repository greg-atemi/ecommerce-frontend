import type { Product } from "@/types";

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Classic Leather Sneaker",
    description: "Timeless silhouette crafted from full-grain leather with a cushioned insole for all-day comfort.",
    price: 12999,   // stored in cents
    compareAtPrice: 15999,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    ],
    category: "Footwear",
    tags: ["leather", "casual", "classic"],
    rating: 4.5,
    reviewCount: 128,
    stock: 24,
    variants: [
      { id: "v-size", name: "Size", options: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"] },
      { id: "v-color", name: "Color", options: ["White", "Black", "Tan"] },
    ],
  },
  {
    id: "prod-2",
    name: "Merino Wool Crew-Neck",
    description: "Lightweight 100% merino wool sweater, naturally odour-resistant and temperature-regulating.",
    price: 8999,
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
    ],
    category: "Tops",
    tags: ["wool", "knitwear", "essentials"],
    rating: 4.8,
    reviewCount: 64,
    stock: 10,
    variants: [
      { id: "v-size", name: "Size", options: ["XS", "S", "M", "L", "XL"] },
      { id: "v-color", name: "Color", options: ["Navy", "Oatmeal", "Forest Green"] },
    ],
  },
  {
    id: "prod-3",
    name: "Structured Canvas Tote",
    description: "Waxed canvas tote with leather handles and interior zip pocket. Built to last a decade.",
    price: 5999,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4a8a?w=800",
    ],
    category: "Bags",
    tags: ["canvas", "tote", "everyday"],
    rating: 4.3,
    reviewCount: 45,
    stock: 30,
  },
  {
    id: "prod-4",
    name: "Slim-Fit Chino Trousers",
    description: "Stretch-cotton chinos with a tailored slim fit — smart enough for the office, relaxed enough for the weekend.",
    price: 7499,
    compareAtPrice: 8999,
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
    ],
    category: "Bottoms",
    tags: ["chino", "slim", "versatile"],
    rating: 4.6,
    reviewCount: 92,
    stock: 18,
    variants: [
      { id: "v-waist", name: "Waist", options: ["28", "30", "32", "34", "36"] },
      { id: "v-length", name: "Length", options: ["30", "32", "34"] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format cents as a locale currency string, e.g. 12999 → "KSh 12,999" */
export function formatPrice(cents: number, currency = "KES"): string {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}
