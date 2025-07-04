import React from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label?: string;
}

export function StarRating({ rating, onRatingChange, label }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="block font-medium mb-1 text-gray-700">{label}</label>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`focus:outline-none text-3xl transition ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
            onClick={() => onRatingChange(star)}
            aria-label={`Dar nota ${star} de 5`}
            tabIndex={0}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-gray-500 text-sm">{rating || 0} / 5</span>
      </div>
    </div>
  );
} 