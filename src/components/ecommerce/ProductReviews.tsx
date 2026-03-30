import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, CheckCircle2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { getReviewsForProduct, getRatingDistribution } from "@/data/reviews";
import type { Review } from "@/types";

// ─── Write-review schema ──────────────────────────────────────────────────────
const reviewSchema = z.object({
  author: z.string().min(2, "Name must be at least 2 characters"),
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(20, "Review must be at least 20 characters"),
});
type ReviewForm = z.infer<typeof reviewSchema>;

// ─── StarRating input ─────────────────────────────────────────────────────────
function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Single review card ───────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(false);

  return (
    <div className="space-y-3 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={review.avatarUrl} />
            <AvatarFallback className="text-xs">
              {review.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{review.author}</p>
              {review.verified && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                  Verified purchase
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(review.createdAt))}
            </p>
          </div>
        </div>
        {/* Stars */}
        <div className="flex shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-4 w-4 ${
                s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="font-medium text-sm">{review.title}</p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{review.body}</p>
      </div>

      <button
        onClick={() => setHelpful((h) => !h)}
        className={`flex items-center gap-1.5 text-xs transition-colors ${
          helpful ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        {helpful ? "Marked as helpful" : "Helpful?"}
      </button>
    </div>
  );
}

// ─── Rating summary bar ───────────────────────────────────────────────────────
function RatingSummary({
  productId,
  averageRating,
  reviewCount,
}: {
  productId: string;
  averageRating: number;
  reviewCount: number;
}) {
  const dist = getRatingDistribution(productId);
  const max = Math.max(...Object.values(dist), 1);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      {/* Big number */}
      <div className="flex flex-col items-center gap-1 text-center min-w-[80px]">
        <p className="text-5xl font-bold">{averageRating.toFixed(1)}</p>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-4 w-4 ${
                s <= Math.round(averageRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {reviewCount} review{reviewCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Bars */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = dist[star] ?? 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="w-2 text-xs text-muted-foreground">{star}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
              <Progress value={(count / max) * 100} className="h-2 flex-1" />
              <span className="w-3 text-xs text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

export function ProductReviews({
  productId,
  averageRating,
  reviewCount,
}: ProductReviewsProps) {
  const [open, setOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const persistedReviews = getReviewsForProduct(productId);
  const allReviews = [...localReviews, ...persistedReviews];

  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { author: "", rating: 0, title: "", body: "" },
  });

  function onSubmit(data: ReviewForm) {
    const newReview: Review = {
      id: `rev-local-${Date.now()}`,
      productId,
      author: data.author,
      rating: data.rating,
      title: data.title,
      body: data.body,
      createdAt: new Date().toISOString(),
      verified: false,
    };
    setLocalReviews((prev) => [newReview, ...prev]);
    form.reset();
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Summary + CTA */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <RatingSummary
          productId={productId}
          averageRating={averageRating}
          reviewCount={allReviews.length || reviewCount}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Write a review</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Write a review</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <StarRatingInput
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review title</FormLabel>
                      <FormControl>
                        <Input placeholder="Sum it up in a sentence" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your review</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell others what you think..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit review</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Review list */}
      {allReviews.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          <p>No reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="divide-y">
          {allReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
