import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getFavoriteGames, getReviewsByUser } from '../services/gameService';
import { Game, Review } from '../types';
import Spinner from '../components/Spinner';
import GameCard from '../components/GameCard';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [favs, reviews] = await Promise.all([
          getFavoriteGames(user.id),
          getReviewsByUser(user.id),
        ]);
        setFavoriteGames(favs);
        setUserReviews(reviews.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Could not load your dashboard data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-2xl text-red-500">{error}</p>;
  if (!user) return <div>Please log in to view your dashboard.</div>;

  return (
    <div>
      <BackButton />
      <div className="space-y-12">
        <h1 className="text-4xl font-extrabold text-center">Welcome, <span className="text-primary">{user.username}</span>!</h1>

        <section>
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">Your Favorite Games</h2>
          {favoriteGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteGames.map(game => <GameCard key={game.id} game={game} />)}
            </div>
          ) : (
            <p>You haven't added any favorite games yet. Start exploring!</p>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-secondary pl-4">Your Reviews</h2>
          {userReviews.length > 0 ? (
            <div className="space-y-4">
              {userReviews.map(review => (
                <div key={review.id} className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg">
                    <Link to={`/game/${review.gameId}`} className="hover:text-primary transition-colors">{review.gameName}</Link>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rated: {review.rating}/5</p>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">"{review.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't reviewed any games yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;