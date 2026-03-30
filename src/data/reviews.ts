import type { Review } from "@/types";

export const reviews: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    author: "James M.",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=JM",
    rating: 5,
    title: "Best sneakers I've owned",
    body: "Unbelievable quality for the price. The leather broke in perfectly after a week and they're now the most comfortable shoes I own. The sizing runs true — I'm a UK 9 and ordered a UK 9, perfect fit.",
    createdAt: "2026-02-14T08:30:00Z",
    verified: true,
  },
  {
    id: "rev-2",
    productId: "prod-1",
    author: "Amina K.",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=AK",
    rating: 4,
    title: "Solid craftsmanship, slight colour variance",
    body: "The tan colourway I received was slightly darker than the product photo, but still looks great. Build quality is excellent and they've held up well over three months of daily wear.",
    createdAt: "2026-01-28T14:15:00Z",
    verified: true,
  },
  {
    id: "rev-3",
    productId: "prod-1",
    author: "David O.",
    rating: 4,
    title: "Great everyday shoe",
    body: "Versatile enough to wear with chinos to the office or jeans on weekends. The cushioned insole makes a real difference for long days on your feet.",
    createdAt: "2026-03-10T09:00:00Z",
    verified: false,
  },
  {
    id: "rev-4",
    productId: "prod-2",
    author: "Priya S.",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=PS",
    rating: 5,
    title: "Worth every shilling",
    body: "I was hesitant at the price point but this sweater has been worth every cent. Three months in, no pilling, holds its shape perfectly, and the merino keeps me comfortable across all the Nairobi weather.",
    createdAt: "2026-03-01T11:45:00Z",
    verified: true,
  },
  {
    id: "rev-5",
    productId: "prod-3",
    author: "Tom W.",
    rating: 4,
    title: "Tank of a bag",
    body: "Bought this six months ago and it already looks like it has character. The waxed canvas repels light rain and the leather handles are softening up nicely. Interior zip pocket is a lifesaver.",
    createdAt: "2026-02-20T16:30:00Z",
    verified: true,
  },
];

export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

/** Average rating across all reviews for a product (falls back to product.rating) */
export function getAverageRating(productId: string): number {
  const productReviews = getReviewsForProduct(productId);
  if (productReviews.length === 0) return 0;
  return productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
}

/** Distribution of star ratings, e.g. { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 } */
export function getRatingDistribution(productId: string): Record<number, number> {
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  getReviewsForProduct(productId).forEach((r) => {
    dist[r.rating] = (dist[r.rating] ?? 0) + 1;
  });
  return dist;
}
