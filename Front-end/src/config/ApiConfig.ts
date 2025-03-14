const BASE_URL = "http://localhost:8000/api";
const URL_IMAGE = "http://localhost:8000";

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

const GET_CALENDAR = `${BASE_URL}/calendarShow`;
const CREATE_CALENDAR = `${BASE_URL}/calendarShow`;
const DELETE_CALENDAR = (id: number) => `${BASE_URL}/calendarShow/${id}`;
const UPDATE_CALENDAR = (id: number) => `${BASE_URL}/calendarShow/${id}`;
const DETAIL_CALENDAR = (id: number) => `${BASE_URL}/calendarShow/${id}`;

const GET_ONE_SHOWTIMES = `${BASE_URL}/show-times/by-date`; // tìm kiếm suất chiếu qua ngày và phòng chiếu
// const GET_ALL_SHOWTIMES = (date: string) =>
//     `${BASE_URL}/show-times/filter-by-date/${date}`;
const UPDATE_SHOWTIMES = `${BASE_URL}/showTime`;
const DELETE_ONE_SHOWTIMES = (id: number, selected_date: string) =>
    `${BASE_URL}/showtimes/${id}/destroy-by-date/${selected_date}`; // xóa suất chiếu
const GET_DETAIL_ONE_SHOWTIMES = (id: number) => `${BASE_URL}/showTime/${id}`; // chi tiết suất chiếu
const UPDATE_ONE_SHOWTIMES = (id: number) => `${BASE_URL}/showTime/${id}`; // cập nhật suất chiếu
const GET_DATES_BY_CALENDAR = `${BASE_URL}/show-times/get-date-range-by-calendar`; // lấy những ngày trong lịch chiếu
const GET_RANGE = `${BASE_URL}/show-times/in-range`;

const GET_ROOMS = `${BASE_URL}/room`;
const GET_SHOW_BY_FILM_DATE = `${BASE_URL}/showtimes-client/by-date`; // lấy suất chiếu qua ngày chiếu

const GET_USER = `${BASE_URL}/user`;
const UPDATE_USER_CLIENT = `${BASE_URL}/update-profile`;
const GET_ARTICLE = `${BASE_URL}/article`;
const CREATE_ARTICLE = `${BASE_URL}/article`;
const UPDATE_ARTICLE = (id: number) => `${BASE_URL}/article/${id}`;
const DELETE_ARTICLE = (id: number) => `${BASE_URL}/article/${id}`;
const GOOGLE_CALLBACK = `${BASE_URL}/auth/google/callback`;
const GET_COMBOS = `${BASE_URL}/combos`;

const GET_TICKETSPRICE = `${BASE_URL}/ticket-management`;
const DETAIL_TICKETPRICE = (id: number) =>
    `${BASE_URL}/ticket-management/${id}`;
const ADD_TICKETSPRICE = `${BASE_URL}/ticket-management`;
const DELETE_TICKETPRICE = (id: number) =>
    `${BASE_URL}/ticket-management/${id}`;
const UPDATE_TICKETPRICE = (id: number) =>
    `${BASE_URL}/ticket-management/${id}`;
export {
    GOOGLE_CALLBACK,
    UPDATE_USER_CLIENT,
    GET_USER,
    GET_ARTICLE,
    CREATE_ARTICLE,
    UPDATE_ARTICLE,
    DELETE_ARTICLE,
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
    URL_IMAGE,
    GET_ONE_SHOWTIMES,
    GET_CALENDAR,
    DELETE_CALENDAR,
    CREATE_CALENDAR,
    UPDATE_CALENDAR,
    DETAIL_CALENDAR,
    // GET_ALL_SHOWTIMES,
    UPDATE_SHOWTIMES,
    DELETE_ONE_SHOWTIMES,
    GET_DETAIL_ONE_SHOWTIMES,
    GET_DATES_BY_CALENDAR,
    UPDATE_ONE_SHOWTIMES,
    GET_ROOMS,
    GET_SHOW_BY_FILM_DATE,
    GET_COMBOS,
    GET_TICKETSPRICE,
    ADD_TICKETSPRICE,
    DELETE_TICKETPRICE,
    UPDATE_TICKETPRICE,
    DETAIL_TICKETPRICE,
};
