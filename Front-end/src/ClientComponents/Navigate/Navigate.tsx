import React from "react";
import "./Navigate.css";
import { Link } from "react-router-dom";

const Navigate = () => {
    return (
        <div className="navigate main-base">
            <Link className="playingFilm film" to={"/playingFilm"}>
                Phim đang chiếu
            </Link>
            <Link className="comingFilm film" to={"/comingFilm"}>
                Phim sắp chiếu
            </Link>
            <Link className="cinemaFilm film" to={"/cinemaFilm"}>
                Rạp Forest
            </Link>
        </div>
    );
};

export default Navigate;
