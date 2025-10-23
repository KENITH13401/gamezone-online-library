import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { SunIcon, MoonIcon } from '../constants';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-light-card dark:bg-dark-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-primary">
          GameZone
        </Link>

        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for games..."
              className="w-full px-4 py-2 rounded-full bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        </div>

        <nav className="flex items-center space-x-4">
          <Link to="/explore" className="font-medium hover:text-primary transition-colors">Explore</Link>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6 text-yellow-400" />}
          </button>
          
          {user ? (
            <>
              <Link to="/dashboard" className="font-medium hover:text-primary transition-colors">Dashboard</Link>
              <button onClick={logout} className="font-medium hover:text-primary transition-colors">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;