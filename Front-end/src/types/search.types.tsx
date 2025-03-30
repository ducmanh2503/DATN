export interface MovieGenre {
  id: number;
  name_genre: string;
}

export interface MovieActor {
  id: number;
  name_actor: string;
}

export interface MovieDirector {
  id: number;
  name_director: string;
}

export interface SearchMovie {
  id: number;
  title: string;
  poster: string;
  release_date: string;
  running_time: string;
  language: string;
  rated: string;
  description: string;
  trailer: string;
<<<<<<< HEAD
  movie_status: 'now_showing' | 'coming_soon';
=======
  movie_status: "now_showing" | "coming_soon";
>>>>>>> main
  genres: MovieGenre[];
  actors: MovieActor[];
  directors: MovieDirector;
  created_at?: string;
  updated_at?: string;
}

export interface SearchResponse {
  message: string;
  data: SearchMovie[];
}

export interface SearchRequest {
  keyword?: string;
<<<<<<< HEAD
  status?: 'now_showing' | 'coming_soon';
  genres?: string;
  sort?: 'latest' | 'oldest';
=======
  status?: "now_showing" | "coming_soon";
  genres?: string;
  sort?: "latest" | "oldest";
>>>>>>> main
}
