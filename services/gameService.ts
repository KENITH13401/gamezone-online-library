import { Game, Review } from '../types';

// --- API CONFIGURATION ---
// IMPORTANT: API keys should not be hardcoded in the source code.
// They should be stored in environment variables and accessed via process.env.
// The fallback is for the development environment where an .env file might not be present.
const API_KEY = process.env.RAWG_API_KEY || '02cfe98673724b1da36d0446756c750f';
const API_BASE = 'https://api.rawg.io/api';

interface ApiListResponse<T> {
  results: T[];
}

/**
 * A helper function to fetch data from the RAWG API.
 * @param endpoint The API endpoint to call.
 * @returns A promise that resolves with the JSON response.
 */
const apiFetch = async <T>(endpoint: string): Promise<T> => {
    const url = `${API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown API error" }));
        throw new Error(`API call to ${url} failed: ${errorData.detail || response.statusText}`);
    }
    return response.json();
};


// --- MOCK DATABASE with LOCALSTORAGE PERSISTENCE ---
// This section simulates a real-time, shared database using the browser's localStorage.
//
// HOW IT WORKS:
// - All reviews and favorites are stored in a single, central place in the browser's storage.
// - This means any review posted by ANY user account is visible to ANY OTHER user account,
//   as long as they are using the SAME BROWSER. This creates a shared experience.
//
// LIMITATIONS:
// - Since localStorage is specific to one browser, data is NOT shared between different
//   browsers (e.g., Chrome and Firefox) or different devices. A true multi-device
//   real-time system would require a dedicated backend server.
//
const SIMULATED_DELAY = 300; // Reduced delay for a snappier feel

const initializeLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    } catch (error) {
        console.error(`Error initializing localStorage for key "${key}":`, error);
        return defaultValue;
    }
};

// Default data for first-time users
const DEFAULT_REVIEWS: Review[] = [
    { id: 'rev1', gameId: 3498, gameName: 'Grand Theft Auto V', userId: 'user123', username: 'GamerGod', rating: 5, comment: 'An absolute masterpiece. The world is huge and there is so much to do!', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'rev2', gameId: 3328, gameName: 'The Witcher 3: Wild Hunt', userId: 'user456', username: 'WitcherFan', rating: 5, comment: 'Best RPG ever made. The story and characters are unforgettable.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'rev3', gameId: 3498, gameName: 'Grand Theft Auto V', userId: 'user789', username: 'CasualPlayer', rating: 4, comment: 'Online mode is fun with friends, but can be grindy.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'rev4', gameId: 4286, gameName: 'Half-Life 2', userId: 'user123', username: 'GamerGod', rating: 5, comment: 'A timeless classic that changed FPS games forever.', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

const DEFAULT_FAVORITES: { [userId: string]: number[] } = {
    'user123': [3498, 4200, 28, 4286]
};

// Initialize our "database" from localStorage or defaults
let MOCK_REVIEWS = initializeLocalStorage<Review[]>('gamezone_reviews', DEFAULT_REVIEWS);
let MOCK_FAVORITES = initializeLocalStorage<{ [userId: string]: number[] }>('gamezone_favorites', DEFAULT_FAVORITES);


// --- LIVE API GAME FUNCTIONS ---

export const getPopularGames = async (): Promise<Game[]> => {
  // fix: Removed random page fetching for a consistent user experience.
  const data = await apiFetch<ApiListResponse<Game>>(`/games?ordering=-rating&page_size=6&page=1`);
  return data.results;
};

export const getTrendingGames = async (): Promise<Game[]> => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const startDate = oneYearAgo.toISOString().split('T')[0];
  const todayDate = new Date().toISOString().split('T')[0];
  // fix: Removed random page fetching for a consistent user experience.
  const data = await apiFetch<ApiListResponse<Game>>(`/games?dates=${startDate},${todayDate}&ordering=-added&page_size=6&page=1`);
  return data.results;
};

interface SearchParams {
  query: string;
  genre?: string | null;
  platform?: string | null;
  year?: string | null;
}
export const searchGames = async (params: SearchParams): Promise<Game[]> => {
    const { query, genre, platform, year } = params;
    
    if (!query && !genre && !platform && !year) {
        return [];
    }

    let endpoint = '/games?';
    if (query) endpoint += `&search=${encodeURIComponent(query)}`;
    if (genre) endpoint += `&genres=${genre}`;
    if (platform) endpoint += `&parent_platforms=${platform}`;
    if (year) endpoint += `&dates=${year}-01-01,${year}-12-31`;

    const data = await apiFetch<ApiListResponse<Game>>(endpoint.replace('?&', '?'));
    return data.results;
};

export const getGameDetails = async (id: number): Promise<Game | undefined> => {
    const gameDetails = await apiFetch<Game>(`/games/${id}`);
    const screenshotsData = await apiFetch<ApiListResponse<{id: number, image: string}>>(`/games/${id}/screenshots`);
    
    return {
        ...gameDetails,
        screenshots: screenshotsData.results,
    };
};

// --- MOCK USER DATA FUNCTIONS (Reviews & Favorites) ---

export const getReviewsForGame = (gameId: number): Promise<Review[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // We read directly from localStorage to ensure we get the latest data,
            // even if it was updated in another tab.
            const allReviews: Review[] = JSON.parse(localStorage.getItem('gamezone_reviews') || '[]');
            resolve(allReviews.filter(r => r.gameId === gameId));
        }, SIMULATED_DELAY);
    });
};

export const postReview = (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newReview: Review = {
                ...reviewData,
                id: `rev${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            MOCK_REVIEWS.unshift(newReview);
            localStorage.setItem('gamezone_reviews', JSON.stringify(MOCK_REVIEWS)); // Persist
            resolve(newReview);
        }, SIMULATED_DELAY);
    });
};

export const editReview = (reviewId: string, updates: { rating: number; comment: string }): Promise<Review> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = MOCK_REVIEWS.findIndex(r => r.id === reviewId);
            if (index !== -1) {
                MOCK_REVIEWS[index] = { ...MOCK_REVIEWS[index], ...updates };
                localStorage.setItem('gamezone_reviews', JSON.stringify(MOCK_REVIEWS)); // Persist
                resolve(MOCK_REVIEWS[index]);
            } else {
                reject(new Error("Review not found"));
            }
        }, SIMULATED_DELAY);
    });
};

export const deleteReview = (reviewId: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = MOCK_REVIEWS.findIndex(r => r.id === reviewId);
            if (index !== -1) {
                MOCK_REVIEWS.splice(index, 1);
                localStorage.setItem('gamezone_reviews', JSON.stringify(MOCK_REVIEWS)); // Persist
            }
            resolve();
        }, SIMULATED_DELAY);
    });
};

export const getReviewsByUser = (userId: string): Promise<Review[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_REVIEWS.filter(r => r.userId === userId));
        }, SIMULATED_DELAY);
    });
}

// Favorites
export const getFavorites = (userId: string): Promise<number[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_FAVORITES[userId] || []);
        }, 100);
    });
};

export const addFavorite = (userId: string, gameId: number): Promise<number[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (!MOCK_FAVORITES[userId]) {
                MOCK_FAVORITES[userId] = [];
            }
            if (!MOCK_FAVORITES[userId].includes(gameId)) {
                MOCK_FAVORITES[userId].push(gameId);
            }
            localStorage.setItem('gamezone_favorites', JSON.stringify(MOCK_FAVORITES)); // Persist
            resolve([...MOCK_FAVORITES[userId]]);
        }, SIMULATED_DELAY);
    });
};

export const removeFavorite = (userId: string, gameId: number): Promise<number[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (MOCK_FAVORITES[userId]) {
                MOCK_FAVORITES[userId] = MOCK_FAVORITES[userId].filter(id => id !== gameId);
            }
            localStorage.setItem('gamezone_favorites', JSON.stringify(MOCK_FAVORITES)); // Persist
            resolve([...MOCK_FAVORITES[userId] || []]);
        }, SIMULATED_DELAY);
    });
};

export const getFavoriteGames = async (userId: string): Promise<Game[]> => {
    // PERFORMANCE NOTE: The following is an "N+1 query" problem. For N favorite games,
    // it makes N+1 API calls (1 for IDs, N for details). This is inefficient and slow.
    // A real-world backend API should provide a bulk endpoint to fetch multiple games
    // by their IDs in a single request (e.g., /api/games?ids=1,2,3) to solve this.
    // Since we are limited by the public RAWG API, we accept this limitation here.
    const favoriteIds = await getFavorites(userId);
    if (favoriteIds.length === 0) return [];
    
    const gamePromises = favoriteIds.map(id => getGameDetails(id));
    const favoriteGames = await Promise.all(gamePromises);
    
    return favoriteGames.filter((game): game is Game => game !== undefined);
}

// --- LIVE API FILTER DATA FUNCTIONS ---

export const getAvailableGenres = async (): Promise<{ id: number; name: string }[]> => {
    const data = await apiFetch<ApiListResponse<{ id: number; name: string }>>('/genres?page_size=40');
    return data.results.sort((a,b) => a.name.localeCompare(b.name));
};

export const getAvailablePlatforms = async (): Promise<{ id: number; name: string }[]> => {
    const data = await apiFetch<ApiListResponse<{ id: number; name: string }>>('/platforms/lists/parents?page_size=20');
    return data.results.sort((a,b) => a.name.localeCompare(b.name));
};

export const getAvailableYears = (): Promise<string[]> => {
    return new Promise(resolve => {
        const currentYear = new Date().getFullYear();
        const years: string[] = [];
        for (let y = currentYear; y >= 1990; y--) {
            years.push(y.toString());
        }
        resolve(years);
    });
};