# GameZone - Application Documentation

## 1. Introduction

GameZone is a modern web application designed for video game enthusiasts. It provides a rich, interactive platform to browse, search, and discover games, as well as share opinions through reviews. Users can create accounts, maintain a list of their favorite games, and participate in a community-driven review system.

The application leverages the powerful [RAWG Video Games Database API](https://rawg.io/apidocs) for its extensive game data, while cleverly using the browser's `localStorage` to simulate a persistent backend for user accounts, reviews, and favorites, creating a full-featured experience without requiring a real server.

---

## 2. Core Features

- **User Authentication**: Secure signup, login, and logout functionality. Includes an option for quick sign-in via a mock Google SSO.
- **Game Discovery**: A homepage featuring curated lists of "Trending" and "Popular" games to help users discover new titles.
- **Advanced Search & Filtering**: A dedicated search page allowing users to find games by title, genre, platform, and release year.
- **Detailed Game Pages**: Each game has a comprehensive detail page displaying its description, genres, platforms, screenshots, and overall rating.
- **Interactive Review System**: Logged-in users can post, edit, and delete their own reviews for any game. Reviews include a star rating and a text comment.
- **Real-time Updates**: Reviews are synced across browser tabs. If a user posts a review in one tab, it will appear on the game's page in another tab without a manual refresh.
- **Favorites System**: Users can add or remove games from a personal "Favorites" list, which is accessible from their dashboard.
- **Personalized Dashboard**: An authenticated user gets a dashboard view that aggregates all their favorite games and past reviews for easy access.
- **Responsive Design**: The UI is fully responsive and provides an optimal viewing experience on desktops, tablets, and mobile devices.
- **Dark/Light Theme**: A theme toggler allows users to switch between a light and dark mode aesthetic, with their preference saved locally.

---

## 3. Architecture & Technology Stack

### Frontend

- **Framework**: **React 19** (using modern features like `importmap` for dependency management).
- **Language**: **TypeScript** for type safety and improved developer experience.
- **Routing**: **React Router v7** for handling client-side navigation.
- **Styling**: **Tailwind CSS** for a utility-first, responsive, and modern design.

### State Management

- **React Context API**: Used for managing global state, specifically:
    - `ThemeContext`: Handles the light/dark mode theme.
    - `AuthContext`: Manages the current user's authentication status, profile data, and favorites.

### Data & Backend Simulation

- **Game Data Source**: **RAWG Video Games Database API**. All game-related information (details, images, ratings) is fetched live from this external service.
- **Mock Backend**: **Browser `localStorage`**. To provide a persistent, multi-session experience without a real database, `localStorage` is used to store:
    - **`gamezone_users`**: A list of all user accounts, including mock encrypted passwords.
    - **`gamezone_reviews`**: A global list of all reviews posted by all users.
    - **`gamezone_favorites`**: A mapping of user IDs to their list of favorite game IDs.
    - **`authToken`**: A mock JWT stored after login to maintain the user's session.

> **Note on Mock Backend**: This approach makes the application feel real and stateful. Since `localStorage` is shared for a given domain, any user account created in a browser will be visible to any other "user" on that same browser, simulating a shared database. Data is not shared between different browsers or devices.

---

## 4. Project File Structure

The project is organized into a standard, scalable React application structure.

```
/
├── components/         # Reusable UI components (GameCard, Spinner, etc.)
├── context/            # Global state management (AuthContext, ThemeContext)
├── hooks/              # Custom React hooks (useAuth, useTheme)
├── pages/              # Top-level page components for each route
├── services/           # Logic for API calls and data management
│   ├── authService.ts  # Mock authentication (login, signup)
│   └── gameService.ts  # API calls to RAWG & mock database for reviews/favorites
├── types.ts            # TypeScript type definitions (Game, User, Review)
├── App.tsx             # Main component, handles routing logic
├── index.html          # The single HTML entry point for the app
└── index.tsx           # Mounts the React application to the DOM
```

---

## 5. Key Implementation Details

### `authService.ts`

This service is the heart of the mock backend. It reads and writes to the `gamezone_users` key in `localStorage`. When a user signs up, a new user object is added to this list. When they log in, their credentials are validated against this list.

### `gameService.ts`

This service manages all data fetching. It's split into two main parts:
1.  **Live API Calls**: Functions like `getGameDetails` and `searchGames` make `fetch` requests directly to the RAWG API.
2.  **Mock Data Functions**: Functions like `postReview` and `addFavorite` interact with `localStorage` to simulate writing to a database. They include a `SIMULATED_DELAY` to mimic real network latency.

### API Key Management

The RAWG API key is managed within `index.html` inside a mocked `process.env` object. This makes it accessible to the application's JavaScript code while keeping it out of the React source files. For production, users should replace the placeholder key with their own personal key from `rawg.io`.

### Real-time Review Syncing

In `GameDetailPage.tsx`, a `storage` event listener is attached to the `window`. This event fires whenever `localStorage` is modified from another tab on the same domain. By listening for changes to the `gamezone_reviews` key, the component knows to re-fetch the reviews, ensuring the UI is always in sync.


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

