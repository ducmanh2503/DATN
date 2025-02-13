import { createBrowserRouter } from "react-router-dom";
import Home from "./page/client/Home/home";
import RankingBox from "./ClientComponents/RankingBox/RankingBox";
import PlayingFilm from "./page/client/PlayingFilm/PlayingFilm";
import ComingFilm from "./page/client/ComingFilm/ComingFilm";
import CinemaForest from "./page/client/CinemaForest/CinemaForest";
import PlayingProduct from "./ClientComponents/PlayingProduct/PlayingProduct";

export const router = createBrowserRouter([
    { path: "/", element: <Home></Home> },
    { path: "/playingFilm", element: <PlayingFilm></PlayingFilm> },
    { path: "/comingFilm", element: <ComingFilm></ComingFilm> },
    { path: "/cinemaFilm", element: <CinemaForest></CinemaForest> },

    // { path: "/check", element: <Appp></Appp> },
    { path: "/check1", element: <PlayingProduct></PlayingProduct> },
]);
