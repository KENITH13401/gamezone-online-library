
import React, { useState } from 'react';
import { StarIcon } from '../constants';

interface StarRatingProps {
  count?: number;
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  isEditable?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ count = 5, value, onChange, size = 6, isEditable = true }) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
  const stars = Array(count).fill(0);

  const handleClick = (value: number) => {
    if (isEditable && onChange) {
      onChange(value);
    }
  };

  const handleMouseOver = (newHoverValue: number) => {
    if (isEditable) {
      setHoverValue(newHoverValue);
    }
  };

  const handleMouseLeave = () => {
    if (isEditable) {
      setHoverValue(undefined);
    }
  };
  
  const getColor = (index: number) => {
      const ratingValue = hoverValue ?? value;
      return ratingValue > index ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600';
  }

  return (
    <div className="flex items-center">
      {stars.map((_, index) => (
        <StarIcon
          key={index}
          className={`w-${size} h-${size} ${getColor(index)} ${isEditable ? 'cursor-pointer' : ''}`}
          onClick={() => handleClick(index + 1)}
          onMouseOver={() => handleMouseOver(index + 1)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  );
};

export default StarRating;
