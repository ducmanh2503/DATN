const BASE_URL = "http://localhost:8000/api/movies";

export const GET_FILMS = `${BASE_URL}`;
export const CREATE_FILM = `${BASE_URL}`;
export const UPDATE_FILM = (id: number) => `${BASE_URL}/${id}`;
export const DELETE_ONE_FILM = (id: number) => `${BASE_URL}/${id}`;
