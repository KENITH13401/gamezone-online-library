
import React from 'react';
import { Review } from '../types';
import { useAuth } from '../hooks/useAuth';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
  onEdit: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAuthor = user?.id === review.userId;

  return (
    <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-4">
            <h4 className="font-bold">{review.username}</h4>
            <StarRating value={review.rating} isEditable={false} size={5} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        {isAuthor && (
          <div className="flex space-x-2">
            <button onClick={() => onEdit(review.id)} className="text-sm text-primary hover:underline">Edit</button>
            <button onClick={() => onDelete(review.id)} className="text-sm text-red-500 hover:underline">Delete</button>
          </div>
        )}
      </div>
      <p className="mt-3 text-gray-700 dark:text-gray-300">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;
