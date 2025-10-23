import { User } from '../types';

// ===================================================================================
// !!! MOCK AUTHENTICATION SERVICE !!!
// ===================================================================================
// This file simulates a user authentication backend. In a real-world application,
// this would be replaced by API calls to a secure server.
//
// --- DATABASE ---
// The user database is persisted in the browser's localStorage to ensure that user
// accounts created via signup are not lost on page reload.
//
// --- SECURITY ---
// Passwords are stored in plain text (`password_plaintext`) for demonstration ONLY.
// This is extremely insecure. Real applications MUST hash passwords using a strong,
// one-way algorithm like bcrypt or Argon2 before storing them.
// ===================================================================================

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

const DEFAULT_USERS: (User & { password_plaintext: string })[] = [
    { 
        id: 'user123', 
        username: 'GamerGod', 
        email: 'gamer@god.com', 
        password_plaintext: 'password123',
        favorites: [3498, 4200, 28] 
    },
    {
        id: 'user456',
        username: 'WitcherFan',
        email: 'fan@witcher.com',
        password_plaintext: 'password123',
        favorites: []
    },
    {
        id: 'user789',
        username: 'CasualPlayer',
        email: 'player@casual.com',
        password_plaintext: 'password123',
        favorites: []
    },
    {
        id: 'google-user-007',
        username: 'Agent007',
        email: 'google@user.com', // This user can only log in via Google
        password_plaintext: `google-sso-${Date.now()}`, // Not a real password
        favorites: [3328]
    }
];

// Helper to get the current list of users from localStorage.
// This ensures that every operation has the most up-to-date data.
const getUsersFromStorage = (): (User & { password_plaintext: string })[] => {
    return initializeLocalStorage('gamezone_users', DEFAULT_USERS);
};

// Helper to save a list of users to localStorage.
const saveUsersToStorage = (users: (User & { password_plaintext: string })[]) => {
    localStorage.setItem('gamezone_users', JSON.stringify(users));
};


const SIMULATED_DELAY = 500;

interface AuthResponse {
    user: User;
    token: string;
}

/**
 * Simulates a user login.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves with the user and a mock token.
 */
export const login = (email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            const user = users.find(u => u.email === email && u.password_plaintext === password);
            if (user) {
                // In a real app, you would generate a JWT here.
                const token = `mock-jwt-for-${user.id}-${Date.now()}`;
                const { password_plaintext, ...userWithoutPassword } = user;
                resolve({ user: userWithoutPassword, token });
            } else {
                reject(new Error("Invalid email or password."));
            }
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates a login via Google SSO.
 * @returns A promise that resolves with the mock Google user and a token.
 */
export const loginWithGoogle = (): Promise<AuthResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            const googleUser = users.find(u => u.id === 'google-user-007');
            if (googleUser) {
                const token = `mock-jwt-for-${googleUser.id}-${Date.now()}`;
                const { password_plaintext, ...userWithoutPassword } = googleUser;
                resolve({ user: userWithoutPassword, token });
            }
            // In a real app, you'd handle the case where the Google user doesn't exist yet
            // by creating a new account for them. For this mock, we assume the user exists.
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates a user signup.
 * @param username The desired username.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves with the new user and a mock token.
 */
export const signup = (username: string, email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromStorage();

            if (users.some(u => u.email === email)) {
                return reject(new Error("An account with this email already exists."));
            }
            if (users.some(u => u.username === username)) {
                return reject(new Error("This username is already taken."));
            }

            const newUser: User & { password_plaintext: string } = {
                id: `user${Date.now()}`,
                username,
                email,
                password_plaintext: password,
                favorites: [],
            };

            const updatedUsers = [...users, newUser];
            saveUsersToStorage(updatedUsers);

            const token = `mock-jwt-for-${newUser.id}-${Date.now()}`;
            const { password_plaintext, ...userWithoutPassword } = newUser;
            
            resolve({ user: userWithoutPassword, token });
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates fetching a user profile using a token.
 * @param token The authentication token.
 * @returns A promise that resolves with the user's data.
 */
export const getUserProfile = (token: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            try {
                // In a real app, the backend would validate the JWT and return the user.
                // Here, we just parse our mock token.
                const userId = token.split('-')[3]; 
                const user = users.find(u => u.id === userId);
                if (user) {
                    const { password_plaintext, ...userWithoutPassword } = user;
                    resolve(userWithoutPassword);
                } else {
                    reject(new Error("Invalid token: User not found."));
                }
            } catch (e) {
                reject(new Error("Invalid token format."));
            }
        }, 150); // Shorter delay for profile fetching
    });
};