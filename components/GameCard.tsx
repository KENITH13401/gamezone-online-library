
import React from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../types';
import { StarIcon } from '../constants';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group">
      <Link to={`/game/${game.id}`}>
        <div className="relative">
          <img 
            src={game.background_image} 
            alt={game.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{game.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{game.released}</p>
          <div className="flex items-center mt-2">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span className="font-bold">{game.rating}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({game.ratings_count} ratings)</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GameCard;
