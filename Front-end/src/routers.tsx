import { createBrowserRouter } from "react-router-dom";
import Home from "./page/client/Home/home";
import PlayingFilm from "./page/client/PlayingFilm/PlayingFilm";
import ComingFilm from "./page/client/ComingFilm/ComingFilm";
import CinemaForest from "./page/client/CinemaForest/CinemaForest";
import AdminLayout from "./page/admin/AdminLayout";
import FilmManage from "./page/admin/FilmManage/FilmManage";
import StoppedMovies from "./page/admin/FilmManage/StoppedMovies";
import AddFilm from "./page/admin/FilmManage/AddFilm";
import CalendarManage from "./page/admin/CalendarShow/CalendarManage";
import ShowtimesManage from "./page/admin/Showtimes/ShowtimesManage";
import ActorsManage from "./page/admin/Actors/ActorsManage";
import GenresManage from "./page/admin/Genres/GenresManage";
import DirectorsManage from "./page/admin/Directors/DirectorsManage";
import Booking from "./page/client/Booking/Booking";

export const router = createBrowserRouter([
  { path: "/", element: <Home></Home> },
  { path: "/playingFilm", element: <PlayingFilm></PlayingFilm> },
  { path: "/comingFilm", element: <ComingFilm></ComingFilm> },
  { path: "/cinemaFilm", element: <CinemaForest></CinemaForest> },
  { path: "/booking", element: <Booking></Booking> },

  {
    path: "/admin",
    element: <AdminLayout></AdminLayout>,
    children: [
      { path: "film", element: <FilmManage></FilmManage> },
      { path: "addFilm", element: <AddFilm></AddFilm> },
      { path: "stoppedMovie", element: <StoppedMovies></StoppedMovies> },
      {
        path: "calendarShow",
        element: <CalendarManage></CalendarManage>,
      },
      { path: "showtimes", element: <ShowtimesManage></ShowtimesManage> },
      { path: "actors", element: <ActorsManage></ActorsManage> },
      { path: "directors", element: <DirectorsManage></DirectorsManage> },
      { path: "genre", element: <GenresManage></GenresManage> },
      // { path: "check", element: <Check></Check> },

//       { path: "film", element: <FilmManage /> },
//       { path: "addFilm", element: <AddFilm /> },
//       { path: "stoppedMovie", element: <StoppedMovies /> },
//       { path: "actors", element: <ActorsManage /> },
//       { path: "directors", element: <DirectorsManage /> },
//       { path: "genre", element: <GenresManage /> },
//       //   { path: "check", element: <Check /> },
//       // { path: "seats", element: <SeatPage /> },
//       // { path: "rooms", element: <RoomPage /> },


    ],
  },
]);
