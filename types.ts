export interface Game {
  id: number;
  name: string;
  released: string;
  background_image: string;
  rating: number;
  ratings_count: number;
  genres: { id: number; name: string }[];
  screenshots?: { id: number; image: string }[];
  description_raw?: string;
  publishers?: { id: number; name: string }[];
  platforms?: { platform: { id: number; name: string } }[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  favorites: number[]; // array of game IDs
}

export interface Review {
  id: string;
  gameId: number;
  gameName: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}