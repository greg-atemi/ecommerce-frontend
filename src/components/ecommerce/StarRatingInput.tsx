import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
    value: number;
    onChange: (value: number) => void;
}

export function StarRatingInput({ value, onChange }: Props) {
    const [hover, setHover] = useState(0);
    const active = hover || value;

    return (
        <div
            className="flex gap-1"
            role="radiogroup"
            aria-label="Rating"
            onMouseLeave={() => setHover(0)}
        >
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => onChange(n)}
                    className="p-0.5"
                >
                    <Star
                        className={`h-7 w-7 transition-colors ${
                            n <= active ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}