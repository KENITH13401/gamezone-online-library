import React, { useState, useEffect, useCallback } from 'react';
import { Game } from '../types';
import { getPopularGames, getTrendingGames } from '../services/gameService';
import GameCard from '../components/GameCard';
import Spinner from '../components/Spinner';
import { RefreshIcon } from '../constants';

const HomePage: React.FC = () => {
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [popular, trending] = await Promise.all([
        getPopularGames(),
        getTrendingGames(),
      ]);
      setPopularGames(popular);
      setTrendingGames(trending);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      setError("We couldn't load the games. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const GameGrid: React.FC<{games: Game[]}> = ({ games }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
  
  const renderContent = (games: Game[]) => {
      if (loading) return <Spinner />;
      if (error) return <p className="text-center text-red-500">{error}</p>;
      return <GameGrid games={games} />;
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold border-l-4 border-primary pl-4">Trending Games</h2>
          <button
            onClick={fetchGames}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh games"
          >
            <RefreshIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {renderContent(trendingGames)}
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 border-l-4 border-secondary pl-4">Popular Games</h2>
        {renderContent(popularGames)}
      </section>
    </div>
  );
};

export default HomePage;