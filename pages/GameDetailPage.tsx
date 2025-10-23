import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Game, Review } from '../types';
import { getGameDetails, getReviewsForGame, postReview, editReview, deleteReview } from '../services/gameService';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import { HeartIcon } from '../constants';
import BackButton from '../components/BackButton';

const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isFavorite, toggleFavorite } = useAuth();
  
  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  
  const fetchGameData = useCallback(async () => {
    if (!id) return;
    try {
      // Don't set loading to true on refetch, only on initial load.
      if (!game) setLoading(true); 
      setError(null);
      const gameId = parseInt(id, 10);
      const [gameDetails, gameReviews] = await Promise.all([
        getGameDetails(gameId),
        getReviewsForGame(gameId),
      ]);
      setGame(gameDetails || null);
      setReviews(gameReviews.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Failed to fetch game data:", error);
      setError("Could not load game details. The game may not exist or the service is unavailable.");
    } finally {
      setLoading(false);
    }
  }, [id, game]);

  useEffect(() => {
    fetchGameData();
  }, [id]); // Note: fetchGameData is not a dependency here to avoid re-running on its own changes.

  // Real-time review listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If the reviews key changed in another tab, refresh the reviews on this page.
      if (e.key === 'gamezone_reviews') {
        console.log("Real-time update: Reviews changed in another tab. Syncing.");
        fetchGameData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchGameData]);


  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !game || userRating === 0 || !userComment.trim()) return;

    try {
      if (editingReviewId) {
        const updatedReview = await editReview(editingReviewId, { rating: userRating, comment: userComment });
        // Optimistic Update: Replace the edited review in the local state
        setReviews(reviews.map(r => r.id === editingReviewId ? updatedReview : r));
      } else {
        const newReview = await postReview({
          gameId: game.id,
          gameName: game.name,
          userId: user.id,
          username: user.username,
          rating: userRating,
          comment: userComment,
        });
        // Optimistic Update: Add the new review to the top of the local state
        setReviews([newReview, ...reviews]);
      }
      // Reset form
      setUserRating(0);
      setUserComment('');
      setEditingReviewId(null);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("There was an error submitting your review. Please try again.");
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingReviewId(review.id);
    setUserRating(review.rating);
    setUserComment(review.comment);
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDeleteClick = async (reviewId: string) => {
      if(window.confirm("Are you sure you want to delete this review?")){
          try {
            await deleteReview(reviewId);
            // Optimistic Update: Remove the deleted review from the local state
            setReviews(reviews.filter(r => r.id !== reviewId));
          } catch(error) {
            console.error("Failed to delete review:", error);
            alert("There was an error deleting your review. Please try again.");
          }
      }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-center text-2xl text-red-500">{error}</div>;
  if (!game) return <div className="text-center text-2xl">Game not found.</div>;

  return (
    <div className="space-y-8">
      <BackButton />
      {/* Header Section */}
      <div style={{ backgroundImage: `url(${game.background_image})` }} className="h-96 rounded-lg bg-cover bg-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <h1 className="text-5xl font-extrabold">{game.name}</h1>
          <p className="text-lg text-gray-300">{game.publishers?.[0]?.name} • {game.released}</p>
        </div>
        {user && (
            <button onClick={() => toggleFavorite(game.id)} className="absolute top-4 right-4 p-3 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors">
                <HeartIcon className={`w-7 h-7 ${isFavorite(game.id) ? 'text-red-500 fill-current' : 'text-white'}`} />
            </button>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="leading-relaxed whitespace-pre-wrap">{game.description_raw}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Screenshots</h2>
          <div className="grid grid-cols-2 gap-4">
            {game.screenshots?.map(ss => (
              <img key={ss.id} src={ss.image} alt="screenshot" className="rounded-lg shadow-md" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
            <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                    {game.genres.map(g => <span key={g.id} className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm">{g.name}</span>)}
                </div>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                    {game.platforms?.map(p => <span key={p.platform.id} className="bg-secondary/20 text-secondary px-2 py-1 rounded-full text-sm">{p.platform.name}</span>)}
                </div>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">Overall Rating</h3>
                <div className="flex items-center space-x-2">
                    <StarRating value={game.rating} isEditable={false} size={7} />
                    <span className="text-2xl font-bold">{game.rating.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">based on {game.ratings_count} ratings</p>
            </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        {user && (
          <form id="review-form" onSubmit={handleReviewSubmit} className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">{editingReviewId ? 'Edit Your Review' : 'Leave a Review'}</h3>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Your Rating</label>
              <StarRating value={userRating} onChange={setUserRating} size={7} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Your Comment</label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows={4}
                className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Share your thoughts..."
              ></textarea>
            </div>
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              {editingReviewId ? 'Update Review' : 'Submit Review'}
            </button>
            {editingReviewId && <button type="button" onClick={() => { setEditingReviewId(null); setUserComment(''); setUserRating(0); }} className="ml-2 text-gray-600 dark:text-gray-300">Cancel</button>}
          </form>
        )}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map(review => <ReviewCard key={review.id} review={review} onEdit={() => handleEditClick(review)} onDelete={handleDeleteClick} />)
          ) : (
            <p>No reviews yet. Be the first to leave one!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;