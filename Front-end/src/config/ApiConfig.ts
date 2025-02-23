const BASE_URL = "http://localhost:8000/api";

const GET_FILM_LIST = `${BASE_URL}/movies`;
const GET_FILM_DETAIL = (id: number) => `${BASE_URL}/movies/${id}`;
const CREATE_FILM = `${BASE_URL}/movies`;
const UPDATE_FILM = (id: number) => `${BASE_URL}/movies/${id}`;
const DELETE_FILM = (id: number) => `${BASE_URL}/movies/${id}`;
const FORCE_DELETE_FILM = (id: number) =>
    `${BASE_URL}/movies/force-delete/${id}`;
const RESTORE_FILM = (id: number) => `${BASE_URL}/movies/restore/${id}`;
const DETAIL_DELETE_FILM = (id: number) =>
    `${BASE_URL}/movies/show-movie-destroy/${id}`;

const GET_DIRECTORS_LIST = `${BASE_URL}/directors`;
const UPDATE_DIRECTORS = (id: number) => `${BASE_URL}/directors/${id}`;
const DELETE_DIRECTORS = (id: number) => `${BASE_URL}/directors/${id}`;

const GET_ACTOR_LIST = `${BASE_URL}/actors`;
const UPDATE_ACTOR = (id: number) => `${BASE_URL}/actors/${id}`;
const DELETE_ACTOR = (id: number) => `${BASE_URL}/actors/${id}`;

const GET_GENRES = `${BASE_URL}/genres`;
const DELETE_GENRES = (id: number) => `${BASE_URL}/genres/${id}`;

export {
    GET_FILM_LIST,
    GET_FILM_DETAIL,
    CREATE_FILM,
    UPDATE_FILM,
    DELETE_FILM,
    FORCE_DELETE_FILM,
    RESTORE_FILM,
    DETAIL_DELETE_FILM,
    GET_DIRECTORS_LIST,
    UPDATE_DIRECTORS,
    DELETE_DIRECTORS,
    GET_ACTOR_LIST,
    UPDATE_ACTOR,
    DELETE_ACTOR,
    GET_GENRES,
    DELETE_GENRES,
};
