import React from "react";
import "./Navigate.css";
import { Link, useLocation } from "react-router-dom";

const Navigate = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    return (
        <div className="navigate main-base">
            <Link
                className={` film ${isActive(`/playingFilm`) ? "nowing" : ""}`}
                to="/playingFilm"
            >
                Phim đang chiếu
            </Link>
            <Link
                className={` comingFilm film ${
                    isActive(`/comingFilm`) ? "nowing" : ""
                }`}
                to="/comingFilm"
            >
                Phim sắp chiếu
            </Link>
            <Link
                className={` film ${isActive(`/cinemaFilm`) ? "nowing" : ""}`}
                to="/cinemaFilm"
            >
                Rạp Forest
            </Link>
        </div>
    );
};

export default Navigate;
