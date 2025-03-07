import { useState, useEffect } from "react";
import PlayingProduct from "../PlayingProduct/PlayingProduct";
import "./PlayingMain.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { URL_IMAGE } from "../../config/ApiConfig";
import { useMessageContext } from "../UseContext/ContextState";
const PlayingMain = ({ showChill }: any) => {
    const [showMore, setShowMore] = useState(false);
    const { setFilmId } = useMessageContext();
    const { data: playingfilm } = useQuery({
        queryKey: ["playingfilms"],
        queryFn: async () => {
            // const { data } = await axios.get(GET_FILM_LIST);
            const { data } = await axios.get(
                "http://localhost:8000/api/movies-index"
            );
            console.log(data.now_showing);

            return data.now_showing.map((film: any) => ({
                ...film,
                key: film.id,
            }));
        },
        staleTime: 1000 * 60 * 10,
    });

    const handleClick = (filmId: number) => {
        setFilmId(filmId);
        console.log("check-id", filmId);
    };
    return (
        <div className="playingMain main-base">
            {playingfilm?.map((film: any, index: number) => (
                <PlayingProduct
                    className={`item-main ${
                        index >= 4 && !showMore ? "hidden" : ""
                    }`}
                    id={film.id}
                    key={film.id}
                    trailer={film.trailer}
                    poster={`${URL_IMAGE}${film.poster}`}
                    genres={film.genres
                        .map((genre: any) => genre.name_genre)
                        .join(", ")}
                    date={film.date}
                    title={film.title}
                    release_date={film.release_date}
                    showChill={showChill}
                    onClick={() => {
                        handleClick(film.id);
                    }}
                />
            ))}
            <button
                className="show-more-btn"
                onClick={() => setShowMore(!showMore)}
            >
                {showMore ? "Ẩn bớt " : "Xem thêm..."}
            </button>
        </div>
    );
};

export default PlayingMain;
