import { createBrowserRouter } from "react-router-dom";
import Home from "./page/client/Home/home";
import PlayingFilm from "./page/client/PlayingFilm/PlayingFilm";
import ComingFilm from "./page/client/ComingFilm/ComingFilm";
import CinemaForest from "./page/client/CinemaForest/CinemaForest";
import PlayingProduct from "./ClientComponents/PlayingProduct/PlayingProduct";
import AdminLayout from "./page/admin/AdminLayout";
import FilmManage from "./page/admin/FilmManage/FilmManage";
import ShowtimesManage from "./page/admin/ShowtimesManage/ShowtimesManage";
import StoppedMovies from "./page/admin/FilmManage/StoppedMovies";
import AddFilm from "./page/admin/FilmManage/AddFilm";

export const router = createBrowserRouter([
    { path: "/", element: <Home></Home> },
    { path: "/playingFilm", element: <PlayingFilm></PlayingFilm> },
    { path: "/comingFilm", element: <ComingFilm></ComingFilm> },
    { path: "/cinemaFilm", element: <CinemaForest></CinemaForest> },

    // { path: "/check", element: <Appp></Appp> },
    { path: "/check1", element: <PlayingProduct></PlayingProduct> },
    {
        path: "/admin",
        element: <AdminLayout></AdminLayout>,
        children: [
            { path: "film", element: <FilmManage></FilmManage> },
            { path: "addFilm", element: <AddFilm></AddFilm> },
            { path: "stoppedMovie", element: <StoppedMovies></StoppedMovies> },

            {
                path: "showtimes",
                element: <ShowtimesManage></ShowtimesManage>,
            },
        ],
    },
]);
