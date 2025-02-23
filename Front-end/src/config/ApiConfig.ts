const BASE_URL = "http://localhost:8000/api/movies";

const GET_FILM_LIST = `${BASE_URL}`;
const GET_FILM_DETAIL = (id: number) => `${BASE_URL}/${id}`;
const CREATE_FILM = `${BASE_URL}`;
const UPDATE_FILM = (id: number) => `${BASE_URL}/${id}`;
const DELETE_FILM = (id: number) => `${BASE_URL}/${id}`;
const FORCE_DELETE_FILM = (id: number) => `${BASE_URL}/force-delete/${id}`;
const RESTORE_FILM = (id: number) => `${BASE_URL}/restore/${id}`;

export {
  GET_FILM_LIST,
  GET_FILM_DETAIL,
  CREATE_FILM,
  UPDATE_FILM,
  DELETE_FILM,
  FORCE_DELETE_FILM,
  RESTORE_FILM,
};
