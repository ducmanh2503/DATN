import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import styles from "./navigate.module.css";

const Navigate = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path; // so sánh để đổi styles
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
