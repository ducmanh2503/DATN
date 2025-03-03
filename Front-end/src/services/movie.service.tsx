import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Adjust this to match your Laravel backend URL

export const fetchMovies = async () => {
    try {
        const response = await axios.get(`${API_URL}/movies`);
        return response.data;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
};

export const fetchMovieById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/movies/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching movie:', error);
        throw error;
    }
};

export const fetchMoviesByGenre = async (genreId: string) => {
    try {
        const response = await axios.get(`${API_URL}/movies?genre_id=${genreId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching movies by genre:', error);
        throw error;
    }
};