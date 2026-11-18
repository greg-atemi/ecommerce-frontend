import { Star } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";

interface Props {
  productId: string | number;
  averageRating: number;
  reviewCount: number;
}

export function ProductReviews({ productId }: Props) {
  const { reviews, isLoading, error } = useReviews(productId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading reviews…</p>;
  if (error) return <p className="text-sm text-destructive">Could not load reviews ({error}).</p>;
  if (reviews.length === 0)
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold">{avg.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">
          from {reviews.length} review{reviews.length !== 1 && "s"}
        </span>
      </div>

      {reviews.map((r) => (
        <div key={r.id} className="space-y-1 border-b pb-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{r.author}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(r.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}