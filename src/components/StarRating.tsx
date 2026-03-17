import { useState } from "react";
import { Star } from "lucide-react";

const LABELS = ["", "Very poor", "Poor", "Satisfactory", "Good", "Excellent"];

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

const StarRating = ({ value, onChange, readonly = false, size = "md" }: StarRatingProps) => {
  const [hover, setHover] = useState(0);
  const starSize = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => onChange?.(star)}
        >
          <Star
            className={`${starSize} transition-colors ${
              star <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
      {!readonly && (hover || value) > 0 && (
        <span className="text-xs text-muted-foreground ml-2">{LABELS[hover || value]}</span>
      )}
    </div>
  );
};

export default StarRating;
