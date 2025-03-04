import React, { useState } from "react";
import PlayingProduct from "../PlayingProduct/PlayingProduct";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_FILM_LIST, URL_IMAGE } from "../../config/ApiConfig";
import "../PlayingMain/PlayingMain.css";
const ComingMain = ({ showChill }: any) => {
    const [showMore, setShowMore] = useState(false);

    const { data: comingfilms } = useQuery({
        queryKey: ["comingfilms"],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_LIST);
            return data.coming_soon.map((film: any) => ({
                ...film,
                key: film.id,
            }));
        },
        staleTime: 1000 * 60 * 10,
    });

    return (
        <div className="playingMain main-base">
            {comingfilms?.map((film: any, index: number) => (
                <PlayingProduct
                    className={`item-main ${
                        index >= 8 && !showMore ? "hidden" : ""
                    }`}
                    key={film.id}
                    id={film.id}
                    title={film.title}
                    trailer={film.trailer}
                    poster={`${URL_IMAGE}${film.poster}`}
                    genres={film.genres
                        .map((genre: any) => genre.name_genre)
                        .join(", ")}
                    release_date={film.release_date}
                    showChill={showChill}
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

export default ComingMain;
