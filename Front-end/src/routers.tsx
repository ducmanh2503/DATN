import { createBrowserRouter } from "react-router-dom";
import Home from "./page/client/Home/home";
import PlayingFilm from "./page/client/PlayingFilm/PlayingFilm";
import ComingFilm from "./page/client/ComingFilm/ComingFilm";
import CinemaForest from "./page/client/CinemaForest/CinemaForest";
import AdminLayout from "./page/admin/AdminLayout";
import FilmManage from "./page/admin/FilmManage/FilmManage";
import StoppedMovies from "./page/admin/FilmManage/StoppedMovies";
import AddFilm from "./page/admin/FilmManage/AddFilm";
import ActorsManage from "./page/admin/Actors/ActorsManage";
import GenresManage from "./page/admin/Genres/GenresManage";
import DirectorsManage from "./page/admin/Directors/DirectorsManage";
import Check from "./page/admin/FilmManage/Check";
import SeatPage from "./page/admin/Seat/SeatPage";
import RoomPage from "./page/admin/RoomPage/RoomPage";
import FilmDetail from "./ClientComponents/FilmDetail/FilmDetail";
import Showtimes from "./ClientComponents/Showtimes/Showtimes";
import Booking from "./ClientComponents/Booking/Booking";
import Payment from "./ClientComponents/Payment/Payment";


export const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/playingFilm", element: <PlayingFilm /> },
    { path: "/comingFilm", element: <ComingFilm /> },
    { path: "/cinemaFilm", element: <CinemaForest /> },
    { path: "/filmDetail/:id", element: <FilmDetail /> },
    { path: "/showtimes/:movieId", element: <Showtimes /> },
    { path: "/booking/:showtimeId/:roomId", element: <Booking /> },
    { path: "/payment/:showtimeId", element: <Payment /> },

    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            { path: "film", element: <FilmManage /> },
            { path: "addFilm", element: <AddFilm /> },
            { path: "stoppedMovie", element: <StoppedMovies /> },
            { path: "actors", element: <ActorsManage /> },
            { path: "directors", element: <DirectorsManage /> },
            { path: "genre", element: <GenresManage /> },
            { path: "check", element: <Check /> },
            { path: "seats", element: <SeatPage /> },
            { path: "rooms", element: <RoomPage /> }
        ],
    },
]);