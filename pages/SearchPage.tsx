import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Game } from '../types';
import { searchGames, getAvailableGenres, getAvailablePlatforms, getAvailableYears } from '../services/gameService';
import GameCard from '../components/GameCard';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton';

interface FilterOptions {
    genres: { id: number; name: string }[];
    platforms: { id: number; name: string }[];
    years: string[];
}

const SearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const query = searchParams.get('q') || '';
    const genreFilter = searchParams.get('genre');
    const platformFilter = searchParams.get('platform');
    const yearFilter = searchParams.get('year');

    const [results, setResults] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ genres: [], platforms: [], years: [] });

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [genres, platforms, years] = await Promise.all([
                    getAvailableGenres(),
                    getAvailablePlatforms(),
                    getAvailableYears(),
                ]);
                setFilterOptions({ genres, platforms, years });
            } catch(e) {
                console.error("Failed to load filter options:", e);
                // Non-critical error, the user can still search.
            }
        };
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            setError(null);
            try {
                const games = await searchGames({ query, genre: genreFilter, platform: platformFilter, year: yearFilter });
                setResults(games);
            } catch (error) {
                console.error("Failed to search games:", error);
                setError("Could not perform search. Please try again later.");
                setResults([]);
            } finally {
                setLoading(false);
            }
        };
        
        // Only search if there is some query or filter
        if (query || genreFilter || platformFilter || yearFilter) {
            performSearch();
        } else {
            setResults([]);
        }
    }, [query, genreFilter, platformFilter, yearFilter]);

    const handleFilterChange = (filterType: 'genre' | 'platform' | 'year', value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(filterType, value);
        } else {
            newParams.delete(filterType);
        }
        setSearchParams(newParams);
    };
    
    const hasActiveFilters = genreFilter || platformFilter || yearFilter;

    const renderResults = () => {
        if (loading) return <Spinner />;
        if (error) return <p className="text-center text-xl text-red-500 mt-12">{error}</p>;
        if (results.length > 0) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>
            );
        }
        if (query || hasActiveFilters) {
             return (
                <p className="text-center text-xl text-gray-500 mt-12">
                    No games found. Try adjusting your search or filters.
                </p>
            );
        }
        return (
            <p className="text-center text-xl text-gray-500 mt-12">
                Use the search bar or filters to find a game.
            </p>
        );
    };

    return (
        <div>
            <BackButton />
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="w-full md:w-1/4">
                    <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md space-y-4 sticky top-24">
                        <h3 className="text-xl font-bold">Filters</h3>
                        
                        {/* Genre Filter */}
                        <div>
                            <label htmlFor="genre-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
                            <select id="genre-filter" value={genreFilter || ''} onChange={(e) => handleFilterChange('genre', e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">All Genres</option>
                                {filterOptions.genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>

                        {/* Platform Filter */}
                        <div>
                            <label htmlFor="platform-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                            <select id="platform-filter" value={platformFilter || ''} onChange={(e) => handleFilterChange('platform', e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">All Platforms</option>
                                {filterOptions.platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        
                        {/* Year Filter */}
                        <div>
                            <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Release Year</label>
                            <select id="year-filter" value={yearFilter || ''} onChange={(e) => handleFilterChange('year', e.target.value)} className="w-full p-2 rounded bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">All Years</option>
                                {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                    </div>
                </aside>
                
                {/* Search Results */}
                <main className="w-full md:w-3/4">
                    <h1 className="text-3xl font-bold mb-6">
                        {query ? <>Search Results for: <span className="text-primary">{query}</span></> : (hasActiveFilters ? "Filtered Results" : "Search Results")}
                    </h1>
                    {renderResults()}
                </main>
            </div>
        </div>
    );
};

export default SearchPage;