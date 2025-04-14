import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { reviewsAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function ReviewForm({ recipe, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        recipeId: recipe._id,
        rating,
        comment: comment.trim()
      };

      await reviewsAPI.create(reviewData);
      toast.success('Review added successfully');
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error(error.response?.data?.message || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Comment
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this recipe..."
          className="min-h-[100px]"
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Adding Review...' : 'Add Review'}
      </Button>
    </form>
  );
} 