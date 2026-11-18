import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StarRatingInput } from "@/components/ecommerce/StarRatingInput";
import { reviewApi, type OrderItemReview } from "@/api/reviewApi";

const MAX_COMMENT = 2000;

const reviewSchema = z.object({
    rating: z.number().min(1, "Please select a star rating."),
    comment: z.string().max(MAX_COMMENT),
    anonymous: z.boolean(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface Props {
    orderItemId: number;
    productName: string;
    existing: OrderItemReview | null;
    onClose: () => void;
    onSaved: (orderItemId: number, review: OrderItemReview) => void;
}

export function ReviewDialog({ orderItemId, productName, existing, onClose, onSaved }: Props) {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: existing?.rating ?? 0,
            comment: existing?.comment ?? "",
            anonymous: existing?.anonymous ?? false,
        },
    });

    const commentLength = watch("comment").length;

    const onSubmit = async (values: ReviewFormValues) => {
        setServerError(null);
        const payload = {
            rating: values.rating,
            comment: values.comment.trim() || undefined,
            anonymous: values.anonymous,
        };
        try {
            const { data } = existing
                ? await reviewApi.update(orderItemId, payload)
                : await reviewApi.create(orderItemId, payload);
            onSaved(orderItemId, data);
            onClose();
        } catch (e: any) {
            setServerError(e.response?.data?.message ?? "Could not save your review. Please try again.");
        }
    };

    return (
        <Dialog.Root open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg focus:outline-none">
                    <Dialog.Close
                        className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </Dialog.Close>

                    <div className="space-y-1.5 pr-6">
                        <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                            {existing ? "Edit your review" : "Write a review"}
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-muted-foreground">
                            {productName}
                        </Dialog.Description>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5" noValidate>
                        {/* Rating */}
                        <div className="space-y-1.5">
                            <Label.Root className="text-sm font-medium">Your rating</Label.Root>
                            <Controller
                                name="rating"
                                control={control}
                                render={({ field }) => (
                                    <StarRatingInput value={field.value} onChange={field.onChange} />
                                )}
                            />
                            {errors.rating && (
                                <p className="text-sm text-destructive">{errors.rating.message}</p>
                            )}
                        </div>

                        {/* Comment */}
                        <div className="space-y-1.5">
                            <Label.Root htmlFor="review-comment" className="text-sm font-medium">
                                Your review <span className="font-normal text-muted-foreground">(optional)</span>
                            </Label.Root>
                            <textarea
                                id="review-comment"
                                rows={4}
                                maxLength={MAX_COMMENT}
                                placeholder="What did you like or dislike? How was the fit and quality?"
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                {...register("comment")}
                            />
                            <p className="text-right text-xs text-muted-foreground">
                                {commentLength}/{MAX_COMMENT}
                            </p>
                        </div>

                        {/* Anonymous */}
                        <div className="flex items-start gap-2.5">
                            <Controller
                                name="anonymous"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox.Root
                                        id="review-anonymous"
                                        checked={field.value}
                                        onCheckedChange={(c) => field.onChange(c === true)}
                                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    >
                                        <Checkbox.Indicator>
                                            <Check className="h-3.5 w-3.5" />
                                        </Checkbox.Indicator>
                                    </Checkbox.Root>
                                )}
                            />
                            <div className="grid gap-0.5">
                                <Label.Root htmlFor="review-anonymous" className="text-sm font-medium leading-none">
                                    Post anonymously
                                </Label.Root>
                                <p className="text-xs text-muted-foreground">
                                    Your name won't be shown. It will appear as "Anonymous".
                                </p>
                            </div>
                        </div>

                        {serverError && (
                            <Alert variant="destructive">
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {existing ? "Save changes" : "Submit review"}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}